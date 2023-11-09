import { dayjs } from "../api/index.js";

export const arr = []
const ininialAmount = 100

export function create({ base = 9.23, percentage = 2, amount = 1000, coin = "atom" } = {}) {
    const payload = {
        date: new Date(),
        amount,
        name: coin,
        base,
        sellAt: base * (1 + percentage / 100),
        buyAt: base * (1 - percentage / 100),
        images: [],
        isActive: true,
        amountToken: ininialAmount / base,
        canBuy:false,
        status:"buy",
        meta:[`no koloda ${ ininialAmount / base} ${coin}`]
    }

    arr.push(payload)
}


export function process(payload) {
    arr.map(x => {
        x.canBuy = payload.close <= x.buyAt

        if(x.status=="sell" && payload.close>=x.sellAt){
          x.stableP = x.p * payload.close;
          x.status="sold"
          x.meta.push(`no rengisa ${x.p} ${x.name}  na wana $${x.stableP}, ${payload.date}`)
          //console.log("Sell",payload.date, x.base, payload.close,x.p,x.stableP);
        }

        if (x.status=="buy" && x.canBuy) {
            x.repayAmount = ininialAmount / payload.close;
            x.p=x.repayAmount-x.amountToken
            x.status="sell"
            x.meta.push(`no badela tshikolodo tsha ${x.amountToken} ${x.name}  nga ${x.repayAmount} ${x.name}, ${payload.date}`)
            create({ base: payload.close })
        }

  
        return x
    })
}