/**
 * Built-in tool classification database
 * Maps known MCP server tools to their capability categories
 *
 * Categories:
 *   ingests_untrusted - reads external/public data
 *   writes_code       - modifies source code, pushes commits
 *   sends_external    - sends data to external endpoints
 *   reads_secrets     - accesses sensitive local data
 *   modifies_infra    - changes infrastructure state
 */
export const TOOL_CLASSIFICATIONS = {
  'mcp-server-github': {
    get_issue: 'ingests_untrusted',
    get_pull_request: 'ingests_untrusted',
    search_issues: 'ingests_untrusted',
    list_issues: 'ingests_untrusted',
    search_code: 'ingests_untrusted',
    get_file_contents: 'reads_secrets',
    create_pull_request: 'writes_code',
    push_files: 'writes_code',
    create_issue: 'writes_code',
    update_issue: 'writes_code',
    create_or_update_file: 'writes_code',
    fork_repository: 'writes_code',
    create_branch: 'writes_code',
  },
  'mcp-server-slack': {
    list_messages: 'ingests_untrusted',
    get_channel_history: 'ingests_untrusted',
    search_messages: 'ingests_untrusted',
    send_message: 'sends_external',
    post_message: 'sends_external',
    upload_file: 'sends_external',
  },
  'mcp-server-filesystem': {
    read_file: 'reads_secrets',
    read_multiple_files: 'reads_secrets',
    list_directory: 'reads_secrets',
    search_files: 'reads_secrets',
    get_file_info: 'reads_secrets',
    write_file: 'writes_code',
    create_directory: 'writes_code',
    move_file: 'writes_code',
    edit_file: 'writes_code',
  },
  'mcp-server-git': {
    git_log: 'reads_secrets',
    git_diff: 'reads_secrets',
    git_status: 'reads_secrets',
    git_show: 'reads_secrets',
    git_commit: 'writes_code',
    git_add: 'writes_code',
    git_push: 'writes_code',
    git_init: 'writes_code',
  },
  'mcp-server-postgres': {
    query: 'reads_secrets',
    list_tables: 'reads_secrets',
    describe_table: 'reads_secrets',
  },
  'mcp-server-sqlite': {
    read_query: 'reads_secrets',
    write_query: 'writes_code',
    list_tables: 'reads_secrets',
  },
  'mcp-server-fetch': {
    fetch: 'ingests_untrusted',
  },
  'mcp-server-brave-search': {
    brave_web_search: 'ingests_untrusted',
    brave_local_search: 'ingests_untrusted',
  },
  'mcp-server-puppeteer': {
    navigate: 'ingests_untrusted',
    screenshot: 'ingests_untrusted',
    click: 'ingests_untrusted',
    evaluate: 'writes_code',
  },
  '@playwright/mcp': {
    browser_navigate: 'ingests_untrusted',
    browser_snapshot: 'ingests_untrusted',
    browser_click: 'ingests_untrusted',
    browser_type: 'ingests_untrusted',
  },
  'mcp-server-kubernetes': {
    kubectl_get: 'reads_secrets',
    kubectl_apply: 'modifies_infra',
    kubectl_delete: 'modifies_infra',
    kubectl_scale: 'modifies_infra',
    kubectl_patch: 'modifies_infra',
  },
  'heroku-mcp-server': {
    list_apps: 'reads_secrets',
    transfer_app: 'modifies_infra',
    scale_formation: 'modifies_infra',
    create_app: 'modifies_infra',
    delete_app: 'modifies_infra',
  },
  'mcp-server-docker': {
    list_containers: 'reads_secrets',
    container_run: 'modifies_infra',
    container_stop: 'modifies_infra',
    container_remove: 'modifies_infra',
    image_pull: 'modifies_infra',
  },
  'google-docs-mcp': {
    get_document: 'ingests_untrusted',
    search_documents: 'ingests_untrusted',
    create_document: 'writes_code',
  },
  'jira-mcp-server': {
    get_issue: 'ingests_untrusted',
    search_issues: 'ingests_untrusted',
    get_ticket: 'ingests_untrusted',
    create_issue: 'writes_code',
  },
  'mcp-server-memory': {
    store: 'writes_code',
    retrieve: 'reads_secrets',
  },
};
