import { ofetch } from "npm:ofetch"
import { DataFrame } from "npm:data-forge"
import dayjs from "npm:dayjs"

import utc from 'https://esm.sh/dayjs/plugin/utc';
import timezone from 'https://esm.sh/dayjs/plugin/timezone';

dayjs.extend(utc)
dayjs.extend(timezone)

const TIMEZONE = "Africa/Johannesburg"

dayjs.tz.setDefault("Africa/Johannesburg")

String.prototype.toSymbol = function () {
    if (this.includes("USDT") || this.includes("BUSD")) {
        return this.toUpperCase();
    }
    return String(`${this}USDT`).toUpperCase();
};

class BinanceApi {
    constructor() {
        this.baseUrl = "https://api.binance.com/api/v3";
        this.apiFetch = ofetch.create({ baseURL: this.baseUrl, retry: 3, retryDelay: 1000, });
    }

    #mapper(data, symbol = "", timeframe = "") {
        return data.map((d) => ({
            time: d[0],
            date: dayjs(d[0]).tz(TIMEZONE).format("YYYY-MM-DD HH:mm"),
            open: d[1] * 1,
            high: d[2] * 1,
            low: d[3] * 1,
            close: d[4] * 1,
            volume: d[5] * 1,
            symbol,
            timeframe,
        }));
    };

    async getOHLCData({ symbol = "ATOMUSDT", interval = "1h", limit = 1000, date } = {}) {
        symbol = symbol.toSymbol();
        let url = `${this.baseUrl}/klines?interval=${interval}&limit=${limit}&symbol=${symbol}`;
        if (date) {
            const dateInMilliseconds = dayjs(date).valueOf()
            url = `${url}&startTime=${dateInMilliseconds}`
        }
        const response = await this.apiFetch(url)
        return this.#mapper(response, symbol, interval)
    }

    async #getOHLCDataWithMilliseconds(symbol = "ATOMUSDT", interval = "1h", dateInMilliseconds) {
        symbol = symbol.toSymbol();
        const url = `${this.baseUrl}/klines?interval=${interval}&limit=1000&symbol=${symbol}&startTime=${dateInMilliseconds}`;
        const response = await await this.apiFetch(url)
        return this.#mapper(response, symbol, interval)
    }

    async getHistoricalOHLCData({ symbol = "ATOMUSDT", timeframe = "1h", startDate, endDate, startPeriod = "day" } = {}) {
        symbol = symbol.toSymbol();

        if (startDate) {
            startDate = dayjs(startDate).tz(TIMEZONE).startOf(startPeriod).toISOString();
        } else {
            startDate = dayjs().tz(TIMEZONE).startOf(startPeriod).toISOString();
        }

        if (endDate) {
            endDate = dayjs(endDate).tz(TIMEZONE).endOf(startPeriod).toISOString();
        } else {
            endDate = dayjs().tz(TIMEZONE).endOf(startPeriod).toISOString();
        }

        let since = dayjs(startDate).valueOf();
        const until = dayjs(endDate).valueOf()
        const ohlcv = [];

        let i = 0
        while (since < until) {
            const partialOHLCV = await this.#getOHLCDataWithMilliseconds(symbol, timeframe, since)
            ohlcv.push(...partialOHLCV);
            since = partialOHLCV[partialOHLCV.length - 1].time;
            //console.log(i,partialOHLCV.length);
            if (partialOHLCV.length < 1000) {
                break;
            }

            i++;
        }

        return new DataFrame(ohlcv).distinct(x => x.time).toArray()
    }

    async getLatestPrice(symbol = "ATOMUSDT") {
        symbol = symbol.toSymbol();
        const url = `${this.baseUrl}/ticker/price?symbol=${symbol}`;
        const response = await await this.apiFetch(url)
        return response
    }

    async getTicker(symbol = "ATOMUSDT") {
        symbol = symbol.toSymbol();
        const url = `${this.baseUrl}/ticker/24hr?symbol=${symbol}`;
        const response = await await this.apiFetch(url)
        return response
    }
}

export const binanceApi = new BinanceApi()
export { dayjs }