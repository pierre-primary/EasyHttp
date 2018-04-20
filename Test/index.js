const { Requester1, Requester2 } = require("./config");

Requester1.GetUserPlayInfo({ userId: 2, brandId: 1003, jj: 4, hjh: 6 });
Requester2.GetUserPlayInfo({ userId: 2, brandId: 1003 });
Requester2.GetUserPlayInfo2({ userId: 2, brandId: 1003 });