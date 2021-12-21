export function getCurrentPages() {
  return window.top.getCurrentPages()
}

export function getCurrentPage() {
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}
