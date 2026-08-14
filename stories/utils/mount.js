// Wraps a `createX(options)` factory as a Storybook `render` function: each
// re-render (e.g. from a Controls change) tears down the previous instance
// before mounting the next one, so window/document-level listeners some
// components attach (magneticButton, suspiciousEyes, ...) don't pile up.
export function mount(createFn) {
  let current;
  return (args) => {
    if (current && typeof current.destroy === 'function') current.destroy();
    current = createFn(args);
    return current.el;
  };
}
