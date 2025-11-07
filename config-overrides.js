const { override, useBabelRc, addDecoratorsLegacy } = require("customize-cra");

module.exports = override(
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useBabelRc(),
  addDecoratorsLegacy()
);
// enable legacy decorators babel plugin
