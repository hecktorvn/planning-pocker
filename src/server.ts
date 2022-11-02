import { serverHttp } from "./http";

import "./websocket";

serverHttp.listen(80, () => console.log("Server is running on PORT 80"));
