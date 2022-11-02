import { serverHttp } from "./http";

import "./websocket";

serverHttp.listen(3000, () => "Server is running on PORT 3000");
