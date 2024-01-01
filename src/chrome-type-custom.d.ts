declare namespace chrome.windows {
  export var CreateType: { [K in Uppercase<createTypeEnum>]: Lowercase<K> };
}
