# Season Data Worker

Recieve scraped seasons from rabbit, if they are different from previously recieved then store and emit season changed event to rabbit.

## Usage

### Configuration

Provide all configuration details via environment variables

| Name                     | Default Value                         | Description                                |
| ------------------------ | ------------------------------------- | ------------------------------------------ |
| RABBIT_MQ_USER           | scraper                               | Username to connect to rabbit              |
| RABBIT_MQ_PASS           | scraper                               | Password to connect to rabbit              |
| RABBIT_MQ_HOST           | localhost                             | Hostname of the rabbit instance            |
| RABBIT_MQ_PORT           | 5672                                  | Port on which to connect to rabbit         |
| RABBIT_MQ_READ_EXCHANGE  | scraped_seasons                       | Exchange to read seasons from              |
| RABBIT_MQ_WRITE_EXCHANGE | changed_season_teams                  | Exchange to write season changes to        |
| RABBIT_MQ_READ_QUEUE     | season_data_worker\_\_scraped_seasons | Persistent queue to read messages from     |
| MYSQL_HOST               | localhost                             | Hostname of the mysql instance             |
| MYSQL_USER               | dataworker                            | Username to connect to mysql               |
| MYSQL_PASS               | dataworker                            | Password to connect to mysql               |
| MYSQL_DATABASE           | season_data                           | The mysql database to use for data         |
| LOG_LEVEL                | info                                  | The minimum log level that will be printed |

### Migrations

Migrate with `npx knex migrate:latest`

Rollback last migration batch with `npx knex migrate:rollback`

### Docker Run

A manual run can be done with docker using the following command:

`docker run --env-file=.env vcalendars/scraper-worker`

### Local Runs

A local run can be done with:

`npm run dev`
