import {binanceApi} from "./src/api/index.js"
import { create, process, arr } from "./src/grid/index.js"


binanceApi.getHistoricalOHLCData({ startDate: "2023-09-01", symbol: "atom" })
    .then(x => {
        create({ base: x[0].close })
        x.forEach(process);
        console.log(arr.map(x => x.meta));
    })