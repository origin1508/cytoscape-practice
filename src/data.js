let endPointCount = 5;

export class EndPoint {
  constructor() {
    this.data = {
      group: "endPoint",
      id: crypto.randomUUID(),
    };
  }
}

export class Edge {
  constructor(source, target) {
    this.data = {
      id: `${source}_${target}`,
      source: source,
      target: target,
    };
  }
}
const endPoints = [{ data: { group: "endPoint", id: "dtr" } }];
const edges = [
  {
    data: {
      id: "controller_dtr",
      source: "controller",
      target: "dtr",
    },
  },
];

for (let i = 0; i < endPointCount; i++) {
  endPoints.push(new EndPoint());
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
    },
  },
  {
    selector: "edge",
    style: {
      width: "0.5px",
      curveStyle: "haystack",
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
    selector: "#controller",
    style: {
      "background-color": "blue",
    },
  },
  {
    selector: "#dtr",
    style: {
      "background-color": "green",
    },
  },
  {
    selector: ".eh-ghost-edge.eh-preview-active",
    style: {
      opacity: 0,
    },
  },
];
