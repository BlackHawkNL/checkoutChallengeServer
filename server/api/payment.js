'use strict';
const axios = require('axios').default;
const Joi = require('joi');
const MerchantAccount = process.env.MERCHANTACCOUNT
const ApiKey = process.env.APIKKEY
const NodeCache = require("node-cache");
const paymentCache = new NodeCache({
  stdTTL: 900,
  checkperiod: 600
});


import {
  v4 as uuidv4
} from 'uuid';

const CLIENTPATH = process.env.CLIENTPATH


const register = function(server, serverOptions) {

  server.route({
    method: 'GET',
    path: '/api/payment/methods',
    options: {
      validate: {
        query: Joi.object({
          value: Joi.number().default(10)
        })
      }
    },
    handler: async function(request, h) {
      // const res = await axios.post('http://example.com')
      const url = "https://checkout-test.adyen.com/v64/paymentMethods"
      const payload = {
        "merchantAccount": "AdyenRecruitmentCOM",
        "countryCode": "NL",
        "amount": {
          "currency": "EUR",
          "value": request.query.value
        },
        "channel": "Web",
        "shopperLocale": "nl-NL"
      }
      let paymentMethods = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-API-key': ApiKey
        }
      })
      return paymentMethods['data']
    }
  });

  server.route({
    method: 'POST',
    path: '/api/payment/request',
    options: {
      validate: {
        payload: Joi.object({
          data: Joi.object().required(),
          cartValue: Joi.number().required()
        })
      }
    },
    handler: async function(request, h) {
      console.log('start payment/request');
      console.log(request.payload);
      const orderId = "nvg_" + uuidv4()
      let payload = {
        amount: {
          currency: "EUR",
          value: request.payload.cartValue
        },
        reference: orderId,
        paymentMethod: request.payload.data.paymentMethod,
        returnUrl: `https://c9080acde89c.ngrok.io/api/payment/return?cartId=${orderId}`,
        merchantAccount: "AdyenRecruitmentCOM",
        shopperIP: request.info.remoteAddress,
        redirectFromIssuerMethod: 'GET'
      }
      if (request.payload.data.browserInfo)
        payload['browserInfo'] = request.payload.data.browserInfo
      if (request.payload.data.billingAddress)
        payload['billingAddress'] = request.payload.data.billingAddress

      const url = 'https://checkout-test.adyen.com/v64/payments'
      let res = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-API-key': ApiKey
        }
      })
      console.log(res['data']);
      console.log('end payment/request');
      paymentCache.set(orderId, res['data']);
      return res['data']
    }
  });

  server.route({
    method: ["GET", "POST"],
    path: '/api/payment/return',
    handler: async function(request, h) {
      console.log('############################');
      console.log('############################');
      let paymentReturn
      let hasResultCode = false
      if (request.payload) {
        if (request.payload.resultCode) {
          paymentReturn = request.payload
          hasResultCode = true
        }
      }
      if (request.query) {
        if (request.query.resultCode) {
          paymentReturn = request.query
          hasResultCode = true
        }
      }
      if (!hasResultCode) {
        const payload = {
          paymentData: paymentCache.get(request.query.cartId)['action']['paymentData'],
          details: {
            MD: request.query.MD,
            PaRes: request.query.PaRes
          }
        }
        const url = 'https://checkout-test.adyen.com/v64/payments/details'
        paymentReturn = await axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'x-API-key': ApiKey
          }
        })
        console.log('###########paymentReturn############');
        paymentReturn = paymentReturn['data']
        console.log(paymentReturn);
      }


      if (paymentReturn.resultCode.toLowerCase() === 'authorised')
        return h.redirect(`${CLIENTPATH}/success`);
      if (paymentReturn.resultCode.toLowerCase() === 'refused')
        return h.redirect(`${CLIENTPATH}/checkout?cartId=abc&reason=refused`)
      if (paymentReturn.resultCode.toLowerCase() === 'cancelled')
        return h.redirect(`${CLIENTPATH}/checkout?cartId=abc&reason=cancelled`)
      if (paymentReturn.resultCode.toLowerCase() === 'error')
        return h.redirect(`${CLIENTPATH}/checkout?cartId=abc&reason=error&msg=${request.query.refusalReason}`)
      if (paymentReturn.resultCode.toLowerCase() === 'pending' || request.query.resultCode.toLowerCase() === 'received')
        return h.redirect(`${CLIENTPATH}/success?status=pending`)
      return h.redirect(`${CLIENTPATH}/checkout?cartId=abc&reason=error`)
    }

  });
};


module.exports = {
  name: 'api-payments',
  dependencies: [],
  register
};
