# Team TDB

## Challenge: Salzburg Card

To run the project, use the following command:

```bash
docker-compose up
```

Make sure to create .env file in apps/cms/.env
See apps/cms/.env.example for reference.

## JSON objects

### TRIP DTO

- userId generated in frontend and persisted in localStorage
- `GET trip?userId=1234`

```json
{
    "planned_visits": [
        {
            "experience": {
                ...
            },
            "start": 12323423,
            "end": 234234234
        }
    ]
}
```

- `POST trip?userId=1234`

```json
{
    "planned_visits": [
        {
            "experience": {
                ...
            },
            "start": 12323423,
            "end": 234234234
        }
    ]
}
```

### Experience DTO

- `GET filter?startDate=2025-11-08T20:31:27.243Z&endDate=...&categories=..`

#### RESULT

```json
{
    [{}]
}
```
