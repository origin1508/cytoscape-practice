import cytoscape from "cytoscape";
import layoutUtilities from "cytoscape-layout-utilities";
import fcose from "cytoscape-fcose";
import d3Force from "cytoscape-d3-force";
import navigator from "cytoscape-navigator";
import edgehandles from "cytoscape-edgehandles";
import cytoscapePopper from "cytoscape-popper";
import dagre from "cytoscape-dagre";
import contextMenus from "cytoscape-context-menus";
import {
  computePosition,
  flip,
  shift,
  limitShift,
  offset,
} from "@floating-ui/dom";
import { EndPoint, Edge, elements, style } from "./data";

import "./index.css";

const navigatorDefaults = {
  container: false, // string | false | undefined. Supported strings: an element id selector (like "#someId"), or a className selector (like ".someClassName"). Otherwise an element will be created by the library.
  viewLiveFramerate: 0, // set false to update graph pan only on drag end; set 0 to do it instantly; set a number (frames per second) to update not more than N times per second
  thumbnailEventFramerate: 30, // max thumbnail's updates per second triggered by graph updates
  thumbnailLiveFramerate: false, // max thumbnail's updates per second. Set false to disable
  dblClickDelay: 200, // milliseconds
  removeCustomContainer: true, // destroy the container specified by user on plugin destroy
  rerenderDelay: 100, // ms to throttle rerender updates to the panzoom for performance
};

const ehDefault = {
  canConnect: function (sourceNode, targetNode) {
    // whether an edge can be created between source and target
    return !sourceNode.same(targetNode); // e.g. disallow loops
  },
  edgeParams: function (sourceNode, targetNode) {
    // for edges between the specified source and target
    // return element object to be passed to cy.add() for edge
    return {};
  },
  hoverDelay: 150, // time spent hovering over a target node before it is considered selected
  snap: true, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
  snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
  snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
  noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
  disableBrowserGestures: true, // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
};

const dagreLayout = {
  name: "fcose",
  randomize: false,
  animate: true,
  gravity: 0.2,
  tile: false,
  nodeRepulsion: (node) => 50000,
  edgeElasticity: (edge) => 102,
  idealEdgeLength: (edge) => 1500,
  nestingFactor: 10.5,
};

function main() {
  cytoscape.use(fcose);
  cytoscape.use(d3Force);
  cytoscape.use(navigator);
  cytoscape.use(edgehandles);
  cytoscape.use(dagre);
  cytoscape.use(contextMenus);
  cytoscape.use(layoutUtilities);

  // popper factory 설정
  // middleware 등록
  // computePosition 메서드로 popper의 위치 설정
  function popperFactory(ref, content, opts) {
    // see https://floating-ui.com/docs/computePosition#options
    const popperOptions = {
      // matching the default behaviour from Popper@2
      // https://floating-ui.com/docs/migration#configure-middleware
      middleware: [flip(), shift({ limiter: limitShift() }), offset()],
      ...opts,
    };

    function update() {
      computePosition(ref, content, popperOptions).then(({ x, y }) => {
        console.log(x, y);
        Object.assign(content.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    }
    update();
    return { update };
  }

  cytoscape.use(cytoscapePopper(popperFactory));

  const cy = cytoscape({
    container: document.getElementById("cy"),
    elements: elements,
    style: style,
  });

  // selector는 jquery 같이 사용이 가능함 => $
  // 기본적으로 CSS 선택자 가능
  // 쿼리를 사용해 data 프로퍼티로 특정 요소들만 선택이 가능함

  function layout() {
    const mainLayout = cy.nodes().not("#controller").layout(dagreLayout);
    mainLayout.run();

    const endPoints = cy.nodes('[group = "endPoint"]');
    const boundingBox = endPoints.boundingBox();

    console.log(boundingBox);
  }
  layout();

  // const endPointLayout = cy.nodes().layout(fcoseLayout);
  // const endPointLayout = cy.nodes('[group = "endPoint"]').layout(fcoseLayout);
  // const endPointLayout = cy.$('[group = "endPoint"]').layout(fcoseLayout);
  // 선택한 요소들로 layout을 따로 적용이 가능함

  // endPointLayout.run();

  // const nav = cy.navigator(navigatorDefaults);
  const menu = cy.contextMenus({
    evtType: "cxttap",
    menuItems: [
      {
        id: "remove",
        content: "remove",
        tooltipText: "remove",
        selector: "node, edge",
        onClickFunction: function (e) {
          const targetId = e.target.data("id");
          if (targetId === "controller") {
            alert("컨트롤러는 제거할 수 없습니다.");
            return;
          }
          cy.$(`#${targetId}`).remove();
        },
      },
      {
        id: "select-all-nodes",
        content: "select all nodes",
        selector: "node",
        coreAsWell: true,
        show: true,
        onClickFunction: function (event) {
          cy.nodes().select();

          menu.hideMenuItem("select-all-nodes");
          menu.showMenuItem("unselect-all-nodes");
        },
      },
      {
        id: "color",
        content: "change color",
        tooltipText: "change color",
        selector: "node",
        hasTrailingDivider: true,
        submenu: [
          {
            id: "color-blue",
            content: "blue",
            tooltipText: "blue",
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.style("background-color", "blue");
            },
            submenu: [
              {
                id: "color-light-blue",
                content: "light blue",
                tooltipText: "light blue",
                onClickFunction: function (event) {
                  let target = event.target || event.cyTarget;
                  target.style("background-color", "lightblue");
                },
              },
              {
                id: "color-dark-blue",
                content: "dark blue",
                tooltipText: "dark blue",
                onClickFunction: function (event) {
                  let target = event.target || event.cyTarget;
                  target.style("background-color", "darkblue");
                },
              },
            ],
          },
          {
            id: "color-green",
            content: "green",
            tooltipText: "green",
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.style("background-color", "green");
            },
          },
          {
            id: "color-red",
            content: "red",
            tooltipText: "red",
            onClickFunction: function (event) {
              let target = event.target || event.cyTarget;
              target.style("background-color", "red");
            },
          },
        ],
      },
    ],
  });

  // popper handle
  const ehManager = {
    eh: cy.edgehandles(ehDefault),
    targetNode: null,
    popperHandle: document.createElement("div"),
    isStarted: false,

    ehStart: function () {
      console.log(ehManager);
      if (ehManager.targetNode) {
        ehManager.eh.start(ehManager.targetNode);
      }
    },

    ehStop: function () {
      if (ehManager.targetNode) {
        ehManager.eh.stop();
        ehManager.popperHandle.classList.add("hidden");
        ehManager.isStarted = false;
      }
    },

    // handle 요소 생성 함수
    // handle의 크기를 zoom 배율에 맞춰 크기 조절 필요
    // handle 생성 관련 로직 수정 필요 -> 잔상
    initPopperHandle: function () {
      ehManager.popperHandle.addEventListener("mousedown", (e) => {
        // 드래그 방지
        e.preventDefault();
        // edge 그리기 시작
        ehManager.ehStart();
      });
      // popper-handle 클래스 추가
      // 초기 보이지 않도록 hidden 클래스 추가
      ehManager.popperHandle.classList.add("popper-handle", "hidden");
      document.body.appendChild(ehManager.popperHandle);
    },

    displayPopperHandle: function (e) {
      if (!ehManager.isStarted) {
        ehManager.isStarted = true;
        ehManager.targetNode = e.target;
        ehManager.popperHandle.classList.remove("hidden");

        ehManager.targetNode.popper({
          content: ehManager.popperHandle,
          popper: {
            placement: "top", // 상단에 핸들 위치
            middleware: [offset(5)], // offset 계산 미들웨어
          },
        });
      }
    },
  };

  ehManager.initPopperHandle();
  window.addEventListener("mouseup", ehManager.ehStop);
  cy.nodes().on("mouseover", ehManager.displayPopperHandle);

  // node를 집었을 때 edge 생성 모드 중단
  cy.nodes().on("grap", () => ehManager.ehStop.apply(ehManager));
  // 화면을 줌, pa
  cy.on("zoom pan", () => ehManager.ehStop.apply(ehManager));

  function initDragAndDropEvent() {
    const endpoint = document.getElementById("endpoint");
    const cyel = document.getElementById("cy");
    endpoint.addEventListener("dragstart", (e) => {
      console.log(e.target);
    });

    // drop 이벤트 적용을 위해 기본동작 방지
    cyel.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    cyel.addEventListener("drop", (e) => {
      // 현재 줌, 팬 상태에 따른 위치 보정
      const pan = cy.pan(); // 현재 팬 상태
      const zoom = cy.zoom(); // 현재 줌 상태

      const graphX = (e.offsetX - pan.x) / zoom; // 그래프의 x 좌표
      const graphY = (e.offsetY - pan.y) / zoom;
      const newEndPoint = new EndPoint(3);

      cy.add({ ...newEndPoint, position: { x: graphX, y: graphY } }).on(
        "mouseover",
        (e) => {
          ehManager.displayPopperHandle.call(ehManager, e);
        }
      );
      cy.$('[group = "endPoint"]')
        .not("#" + newEndPoint.data.id)
        .each((el) => {
          cy.add(new Edge(newEndPoint.data.id, el.id()));
        });
      // const controllerEdge = new Edge(newEndPoint.data.id, "controller");
      // controllerEdge.setLineStyle("dashed");
      // cy.add(controllerEdge);
    });
  }

  initDragAndDropEvent();
}

main();
