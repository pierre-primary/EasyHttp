const { Requester1, Requester2 } = require("./config");

Requester1.GetUserPlayInfo({
    userId: 2,
    brandId: 1003
});

Requester2.GetUserPlayInfo({
    userId: 2,
    brandId: 1003
});

Requester2.GetUserPlayInfo2({
    userId: 2,
    brandId: 1003
});

Requester2.GetUserPlayInfo3.config({ handleCatch: true })({
    userId: 2,
    brandId: 1003,
    jj: 4,
    hjh: 6
}).catch(e => {
    console.log(e);
});

Requester2.GetUserPlayInfo4({
    userId: 2,
    brandId: 1003,
    jj: 4,
    hjh: 6
});
