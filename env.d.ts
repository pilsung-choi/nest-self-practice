declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production'
    readonly PORT: string | '3000'
    readonly BASE_PATH: string
    readonly BASE_URL: string
    readonly DB_TYPE: DataSourceOptions['type']
    readonly DB_HOST: string
    readonly DB_PORT: string
    readonly DB_USER: string
    readonly DB_PWD: string
    readonly DB_NAME: string
    readonly PRIVATE_KEY: string
    readonly SALT_OR_ROUNDS: number
  }
}
