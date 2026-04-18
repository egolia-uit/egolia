# Egolia

<div align="center">

| Service     |                                                                                   Quality Gate                                                                                   |                                                                               Bugs                                                                               |                                                                                  Code Smells                                                                                   |                                                                                   Maintainability                                                                                   |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| **Course**  |  [![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_course&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=egolia-uit_course)  |  [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_course&metric=bugs)](https://sonarcloud.io/summary/new_code?id=egolia-uit_course)  |  [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_course&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=egolia-uit_course)  |  [![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_course&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=egolia-uit_course)  |
| **Billing** | [![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_billing&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=egolia-uit_billing) | [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_billing&metric=bugs)](https://sonarcloud.io/summary/new_code?id=egolia-uit_billing) | [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_billing&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=egolia-uit_billing) | [![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_billing&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=egolia-uit_billing) |
| **Blog**    |    [![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_blog&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=egolia-uit_blog)    |    [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_blog&metric=bugs)](https://sonarcloud.io/summary/new_code?id=egolia-uit_blog)    |    [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_blog&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=egolia-uit_blog)    |    [![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_blog&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=egolia-uit_blog)    |
| **Web**     |     [![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_web&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=egolia-uit_web)     |     [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_web&metric=bugs)](https://sonarcloud.io/summary/new_code?id=egolia-uit_web)     |     [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_web&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=egolia-uit_web)     |     [![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=egolia-uit_web&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=egolia-uit_web)     |

<br/>

[![Wakatime](https://wakatime.com/badge/github/egolia-uit/egolia.svg)](https://wakatime.com/badge/github/egolia-uit/egolia)

</div>

## OTEL

<https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/>

## Dev

- Do not source `.env`, because Nx will not override env that already exist. So, let Nx source itself
- Delete broken symlinks in the current directory and its subdirectories
  ```bash
  find . -type l ! -exec test -e {} \; -print -delete
  ```

## TODO

- [ ] add authentik roles
