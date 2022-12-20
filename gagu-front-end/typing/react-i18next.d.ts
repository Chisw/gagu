declare module 'react-i18next' {
  export const initReactI18next: any
  export const useTranslation = () => ({
    t: (key: string | TemplateStringsArray, params?: any) => string,
    i18n: {
      language: string,
    },
  })
};
