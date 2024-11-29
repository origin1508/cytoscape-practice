let endPointCount = 5;

export class EndPoint {
  static id = 0;

  constructor(type) {
    this.data = {
      group: "endPoint",
      id: crypto.randomUUID(),
      type: type,
      label: `endpoint${EndPoint.id++}`,
    };
  }
}

export class Edge {
  constructor(source, target, type) {
    this.data = {
      id: `${source}_${target}`,
      source: source,
      target: target,
      type: type,
    };
  }
}

const endPoints = [{ data: { group: "endPoint", id: "dtr", type: 1 } }];
const edges = [
  // {
  //   data: {
  //     id: "controller_dtr",
  //     source: "controller",
  //     target: "dtr",
  //     type: 1,
  //   },
  // },
];

for (let i = 0; i < endPointCount; i++) {
  const endPoint = new EndPoint(3);
  const edge = new Edge("controller", endPoint.data.id, 1);
  endPoints.push(endPoint);
  // edges.push(edge);
}

for (let i = 0; i < endPoints.length - 1; i++) {
  for (let j = i + 1; j < endPoints.length; j++) {
    edges.push(new Edge(endPoints[i].data.id, endPoints[j].data.id));
  }
}

export const elements = {
  nodes: [
    {
      data: {
        id: "controller",
        type: 0,
        label: "controller",
      },
    },
    ...endPoints,
  ],
  edges: [...edges],
};

export const style = [
  {
    selector: "node",
    style: {
      width: "15px",
      height: "15px",
      backgroundColor: "blue",
      label: "data(label)", // 커스텀할 수 있도록 html-label-plugin을 사용하는게 좋을 듯
    },
  },
  {
    selector: "node[type=0]",
    style: {
      backgroundColor: "red",
    },
  },
  {
    selector: "node[type=1]",
    style: {
      backgroundColor: "green",
    },
  },
  {
    selector: "edge",
    style: {
      width: "0.5px",
      opacity: 0.3,
      curveStyle: "haystack",
    },
  },
  {
    selector: "edge[type=1]",
    style: {
      width: "0.5px",
      lineColor: "green",
      curveStyle: "unbundled-bezier",
    },
  },
  {
    selector: ".eh-hover",
    style: {
      "background-color": "red",
    },
  },

  {
    selector: ".eh-source",
    style: {
      "border-width": 2,
      "border-color": "red",
    },
  },

  {
    selector: ".eh-target",
    style: {
      "border-width": 2,
      "border-color": "red",
    },
  },

  {
    selector: ".eh-preview, .eh-ghost-edge",
    style: {
      "background-color": "red",
      "line-color": "red",
      "target-arrow-color": "red",
      "source-arrow-color": "red",
    },
  },
  {
    selector: ".eh-ghost-edge.eh-preview-active",
    style: {
      opacity: 0,
    },
  },
];
