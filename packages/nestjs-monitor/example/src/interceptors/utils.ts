export const generateBaseJSON = () => {
  return {
    annotations: {
      list: [
        {
          builtIn: 1,
          datasource: {
            type: 'grafana',
            uid: '-- Grafana --',
          },
          enable: true,
          hide: true,
          iconColor: 'rgba(0, 211, 255, 1)',
          name: 'Annotations & Alerts',
          type: 'dashboard',
        },
      ],
    },
    description: 'Dashboard for API response time visualisations\n',
    editable: true,
    fiscalYearStartMonth: 0,
    graphTooltip: 0,
    id: 5,
    links: [],
    liveNow: false,
    panels: [],
    refresh: '',
    schemaVersion: 38,
    tags: [],
    templating: {
      list: [],
    },
    time: {
      from: 'now-6h',
      to: 'now',
    },
    timepicker: {},
    timezone: '',
    title: 'Response Times',
    uid: 'ec1b884b-753e-405f-8f4b-e0a5d97cf167',
    version: 6,
    weekStart: '',
  };
};

export const generateRow = (name: string) => {
  const textPanel = generateTextPanel(
    name,
    // `# ${name} Response Time Information\n`,
    name,
  );
  const gauagePanel = generateGaugePanel(name);
  const heatmap = generateHeatmap(name);
  const successfulUnsuccessful = generateSuccessfulUnSuccessfulPanel(name);
  const byStatusCode = generateByStatusCode(name);
  const averageReponseTimePanel = generateAverageResponseTimePanel(name);

  return {
    collapsed: true,
    gridPos: {
      h: 1,
      w: 24,
      x: 0,
      y: 0,
    },
    id: 27,
    panels: [
      // textPanel,
      gauagePanel,
      heatmap,
      successfulUnsuccessful,
      byStatusCode,
      averageReponseTimePanel,
    ],
    title: name
      .split('_')
      .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
      .join(' '),
    type: 'row',
  };
};

export const generateTextPanel = (title: string, text: string) => {
  return {
    datasource: {
      type: 'prometheus',
      uid: 'PBFA97CFB590B2093',
    },
    gridPos: {
      h: 1,
      w: 24,
      x: 0,
      y: 0,
    },
    id: 26,
    options: {
      code: {
        language: 'plaintext',
        showLineNumbers: false,
        showMiniMap: false,
      },
      content: text,
      mode: 'markdown',
    },
    pluginVersion: '10.2.0',
    title: title,
    type: 'text',
  };
};

export const generateGaugePanel = (label: string) => {
  return {
    datasource: {
      type: 'prometheus',
      uid: 'PBFA97CFB590B2093',
    },
    fieldConfig: {
      defaults: {
        color: {
          mode: 'thresholds',
        },
        mappings: [],
        thresholds: {
          mode: 'absolute',
          steps: [
            {
              color: 'green',
              value: null,
            },
            {
              color: 'red',
              value: 80,
            },
          ],
        },
      },
      overrides: [],
    },
    gridPos: {
      h: 8,
      w: 12,
      x: 0,
      y: 1,
    },
    id: 25,
    options: {
      minVizHeight: 75,
      minVizWidth: 75,
      orientation: 'auto',
      reduceOptions: {
        calcs: ['lastNotNull'],
        fields: '',
        values: false,
      },
      showThresholdLabels: false,
      showThresholdMarkers: true,
    },
    pluginVersion: '10.2.0',
    targets: [
      {
        datasource: {
          type: 'prometheus',
          uid: 'PBFA97CFB590B2093',
        },
        editorMode: 'code',
        expr: `sum (${label}_count) by (endpoint)`,
        instant: false,
        legendFormat: '__auto',
        range: true,
        refId: 'A',
      },
    ],
    title: 'Total Requests by endpoint',
    type: 'gauge',
  };
};

export const generateHeatmap = (label: string) => {
  return {
    datasource: {
      type: 'prometheus',
      uid: 'PBFA97CFB590B2093',
    },
    fieldConfig: {
      defaults: {
        custom: {
          hideFrom: {
            legend: false,
            tooltip: false,
            viz: false,
          },
          scaleDistribution: {
            type: 'linear',
          },
        },
      },
      overrides: [],
    },
    gridPos: {
      h: 8,
      w: 12,
      x: 12,
      y: 1,
    },
    id: 21,
    options: {
      calculate: false,
      cellGap: 1,
      color: {
        exponent: 0.5,
        fill: 'dark-orange',
        mode: 'scheme',
        reverse: false,
        scale: 'exponential',
        scheme: 'Spectral',
        steps: 64,
      },
      exemplars: {
        color: 'rgba(255,0,255,0.7)',
      },
      filterValues: {
        le: 1e-9,
      },
      legend: {
        show: true,
      },
      rowsFrame: {
        layout: 'auto',
      },
      tooltip: {
        show: true,
        yHistogram: false,
      },
      yAxis: {
        axisPlacement: 'left',
        reverse: false,
        unit: 's',
      },
    },
    pluginVersion: '10.2.0',
    targets: [
      {
        datasource: {
          type: 'prometheus',
          uid: 'PBFA97CFB590B2093',
        },
        editorMode: 'code',
        expr: `sum by (le) (rate(${label}_bucket[30s]))`,
        format: 'heatmap',
        instant: false,
        legendFormat: '{{le}}',
        range: true,
        refId: 'A',
      },
    ],
    title: `Response Time Heatmap`,
    type: 'heatmap',
  };
};

export const generateSuccessfulUnSuccessfulPanel = (label: string) => {
  return {
    datasource: {
      type: 'prometheus',
      uid: 'PBFA97CFB590B2093',
    },
    fieldConfig: {
      defaults: {
        color: {
          mode: 'palette-classic',
        },
        custom: {
          axisBorderShow: false,
          axisCenteredZero: false,
          axisColorMode: 'text',
          axisLabel: '',
          axisPlacement: 'auto',
          barAlignment: 0,
          drawStyle: 'line',
          fillOpacity: 0,
          gradientMode: 'none',
          hideFrom: {
            legend: false,
            tooltip: false,
            viz: false,
          },
          insertNulls: false,
          lineInterpolation: 'linear',
          lineWidth: 1,
          pointSize: 5,
          scaleDistribution: {
            type: 'linear',
          },
          showPoints: 'auto',
          spanNulls: false,
          stacking: {
            group: 'A',
            mode: 'none',
          },
          thresholdsStyle: {
            mode: 'off',
          },
        },
        mappings: [],
        thresholds: {
          mode: 'absolute',
          steps: [
            {
              color: 'green',
              value: null,
            },
            {
              color: 'red',
              value: 80,
            },
          ],
        },
      },
      overrides: [],
    },
    gridPos: {
      h: 8,
      w: 12,
      x: 0,
      y: 9,
    },
    id: 24,
    options: {
      legend: {
        calcs: [],
        displayMode: 'list',
        placement: 'bottom',
        showLegend: true,
      },
      tooltip: {
        mode: 'single',
        sort: 'none',
      },
    },
    targets: [
      {
        datasource: {
          type: 'prometheus',
          uid: 'PBFA97CFB590B2093',
        },
        editorMode: 'code',
        expr: `sum by (statusCode) (rate(${label}_count{statusCode=~"2.."}[1h]))\n`,
        instant: false,
        legendFormat: 'Successful',
        range: true,
        refId: 'A',
      },
      {
        datasource: {
          type: 'prometheus',
          uid: 'PBFA97CFB590B2093',
        },
        editorMode: 'code',
        exemplar: false,
        expr: `sum by (statusCode) (\n  rate(${label}_count{statusCode=~"4.."}[1h])\n) + ignoring(statusCode) group_left sum by (statusCode) (\n  rate(${label}_count{statusCode=~"5.."}[1h])\n)`,
        hide: false,
        instant: false,
        legendFormat: 'Unsuccessful',
        range: true,
        refId: 'B',
      },
    ],
    title: '# Unsuccessful and Successful requests',
    type: 'timeseries',
  };
};

export const generateByStatusCode = (label: string) => {
  return {
    datasource: {
      type: 'prometheus',
      uid: 'PBFA97CFB590B2093',
    },
    fieldConfig: {
      defaults: {
        color: {
          mode: 'palette-classic',
        },
        custom: {
          axisBorderShow: false,
          axisCenteredZero: false,
          axisColorMode: 'text',
          axisLabel: '',
          axisPlacement: 'auto',
          barAlignment: 0,
          drawStyle: 'line',
          fillOpacity: 0,
          gradientMode: 'none',
          hideFrom: {
            legend: false,
            tooltip: false,
            viz: false,
          },
          insertNulls: false,
          lineInterpolation: 'linear',
          lineWidth: 1,
          pointSize: 5,
          scaleDistribution: {
            type: 'linear',
          },
          showPoints: 'auto',
          spanNulls: false,
          stacking: {
            group: 'A',
            mode: 'none',
          },
          thresholdsStyle: {
            mode: 'off',
          },
        },
        mappings: [],
        thresholds: {
          mode: 'absolute',
          steps: [
            {
              color: 'green',
              value: null,
            },
            {
              color: 'red',
              value: 80,
            },
          ],
        },
      },
      overrides: [],
    },
    gridPos: {
      h: 8,
      w: 12,
      x: 12,
      y: 10,
    },
    id: 22,
    unit: 's',
    options: {
      legend: {
        calcs: [],
        displayMode: 'list',
        placement: 'bottom',
        showLegend: true,
      },
      tooltip: {
        mode: 'single',
        sort: 'none',
      },
    },
    targets: [
      {
        datasource: {
          type: 'prometheus',
          uid: 'PBFA97CFB590B2093',
        },
        editorMode: 'code',
        expr: `sum by (statusCode)(${label}_count)`,
        format: 'time_series',
        hide: false,
        instant: false,
        legendFormat: '{{statusCode}}',
        range: true,
        refId: 'B',
      },
    ],
    title: `# requests by status codes`,
    type: 'timeseries',
  };
};

export const generateAverageResponseTimePanel = (label: string) => {
  return {
    datasource: {
      type: 'prometheus',
      uid: 'PBFA97CFB590B2093',
    },
    fieldConfig: {
      defaults: {
        color: {
          mode: 'palette-classic',
        },
        custom: {
          axisBorderShow: false,
          axisCenteredZero: false,
          axisColorMode: 'text',
          axisLabel: '',
          axisPlacement: 'auto',
          barAlignment: 0,
          drawStyle: 'line',
          fillOpacity: 0,
          gradientMode: 'none',
          hideFrom: {
            legend: false,
            tooltip: false,
            viz: false,
          },
          insertNulls: false,
          lineInterpolation: 'linear',
          lineWidth: 1,
          pointSize: 5,
          scaleDistribution: {
            type: 'linear',
          },
          showPoints: 'auto',
          spanNulls: false,
          stacking: {
            group: 'A',
            mode: 'none',
          },
          thresholdsStyle: {
            mode: 'off',
          },
        },
        mappings: [],
        thresholds: {
          mode: 'absolute',
          steps: [
            {
              color: 'green',
              value: null,
            },
            {
              color: 'red',
              value: 80,
            },
          ],
        },
        unit: 's',
      },
      overrides: [],
    },
    gridPos: {
      h: 8,
      w: 12,
      x: 0,
      y: 18,
    },
    id: 23,
    options: {
      legend: {
        calcs: [],
        displayMode: 'list',
        placement: 'bottom',
        showLegend: true,
      },
      tooltip: {
        mode: 'single',
        sort: 'none',
      },
    },
    pluginVersion: '10.2.0',
    targets: [
      {
        datasource: {
          type: 'prometheus',
          uid: 'PBFA97CFB590B2093',
        },
        editorMode: 'code',
        expr: `sum(rate(${label}_sum[30s]))/sum(rate(${label}_count[30s]))`,
        instant: false,
        legendFormat: 'average response time',
        range: true,
        refId: 'A',
      },
    ],
    title: 'Average request response time',
    type: 'timeseries',
  };
};
