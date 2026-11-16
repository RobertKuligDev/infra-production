FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copying only file csproj
COPY src/TemporalWorker.csproj ./ 
RUN dotnet restore

# 2. Copying rest of project
COPY src/. .

RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/runtime:8.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "TemporalWorker.dll"]
