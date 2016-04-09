const getNavigationDelegate = (component) => {
  return component.navigationDelegate ||
    (component.type && component.type.navigationDelegate)
}

export {
  getNavigationDelegate,
}
