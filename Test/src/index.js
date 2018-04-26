const { Requester1, Requester2 } = require("./config");

Requester1.GetUserPlayInfo({
    params: {
        userId: 2,
        brandId: 1003
    }
});

Requester2.GetUserPlayInfo({
    params: {
        userId: 2,
        brandId: 1003
    }
});

Requester2.GetUserPlayInfo2({
    params: {
        userId: 2,
        brandId: 1003
    }
});

Requester2.GetUserPlayInfo3({
    params: {
        userId: 2,
        brandId: 1003,
        jj: 4,
        hjh: 6
    }
});

Requester2.GetUserPlayInfo4({
    params: {
        userId: 2,
        brandId: 1003,
        jj: 4,
        hjh: 6
    }
});
