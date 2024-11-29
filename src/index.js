import cytoscape from "cytoscape";
import layoutUtilities from "cytoscape-layout-utilities";
import fcose from "cytoscape-fcose";
import d3Force from "cytoscape-d3-force";
import navigator from "cytoscape-navigator";
import edgehandles from "cytoscape-edgehandles";
import cytoscapePopper from "cytoscape-popper";
import dagre from "cytoscape-dagre";
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
  name: "dagre",
};

const fcoseLayout = {
  name: "concentric",
  // fit: true,
  // fixedNodeConstraint: [{ nodeId: "dtr", position: { x: 90, y: 100 } }],
  // packComponents: false,
  // animate: false,
  // randomize: false,
};

function main() {
  cytoscape.use(fcose);
  cytoscape.use(d3Force);
  cytoscape.use(navigator);
  cytoscape.use(edgehandles);
  cytoscape.use(dagre);
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
  const mainLayout = cy.layout(dagreLayout);
  mainLayout.run();
  const boundingBox = cy.nodes().boundingBox();
  const boundedLayout = {
    ...fcoseLayout,
    boundingBox: {
      x1: boundingBox.x1,
      y1: boundingBox.y1,
      x2: boundingBox.x2,
      y2: boundingBox.y2,
    },
  };
  // const endPointLayout = cy.nodes().layout(fcoseLayout);
  const endPointLayout = cy.nodes().not("#controller").layout(boundedLayout);
  // const endPointLayout = cy.nodes('[group = "endPoint"]').layout(fcoseLayout);
  // const endPointLayout = cy.$('[group = "endPoint"]').layout(fcoseLayout);
  console.log(cy.nodes().boundingBox());
  console.log(cy.nodes());
  console.log(cy.nodes('[group = "endPoint"]').boundingBox());
  console.log(cy.nodes('[group = "endPoint"]'));
  // 선택한 요소들로 layout을 따로 적용이 가능함

  // endPointLayout.run();

  // const nav = cy.navigator(navigatorDefaults);

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
      const newEndPoint = new EndPoint();

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
