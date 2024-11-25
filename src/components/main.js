import { observer } from "./observer.js"

export const runApp = (dom_element, app) =>{
  observer.observe(dom_element, {
      attributes: true,
      childList: true,
      subtree: true,
    }
  );

  app.setMountElement(dom_element)
  app.render(true)
}