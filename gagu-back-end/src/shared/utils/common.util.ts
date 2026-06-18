export const getIsExpired = (expiredAt?: number) => {
  return expiredAt && expiredAt < Date.now()
}
