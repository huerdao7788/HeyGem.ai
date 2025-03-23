import dotenv from 'dotenv'

dotenv.config()

export const serviceUrl = {
  gateway: process.env.GATEWAY_API
}
