"use strict";

import init, { ServeIPList } from "./lib/LogDataGrabber";

(async () => {
  await init();
  await ServeIPList();
})();
