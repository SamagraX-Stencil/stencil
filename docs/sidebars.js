module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Stencil',
      collapsed: false,
      items: ['home','development_setup'],
    },
    {
      type: 'category',
      label: 'Devops',
      collapsed: false,
      items: [
        'devops/deployment',
        'devops/containerized_development',
        'devops/github_actions',
        'devops/compose_explaination',
      ],
    },
    {
      type: 'category',
      label: 'Logging',
      collapsed: false,
      items: ['logging/overview', 'logging/elk_setup', 'logging/custom_logger', 'logging/what_to_capture'],
    },
    {
      type: 'category',
      label: 'Monitoring',
      collapsed: false,
      items: ['monitoring/nestjs-monitor', 'monitoring/setup'],
    },
    {
      type: 'category',
      label: 'CLI',
      collapsed: false,
      items: ['cli/introduction', 'cli/installation']
    },
    {
      type: 'category',
      label: 'User Service',
      collapsed: false,
      items: ['user-service/introduction'],
    },
    {
      type: 'category',
      label: 'Benchmarking',
      collapsed: false,
      items: [
        'benchmarking/what_are_we_using',
        'benchmarking/boilerplate_setup',
        'benchmarking/configuration_guide',
        'benchmarking/interpreting_the_results',
      ],
    },
  ],
};
