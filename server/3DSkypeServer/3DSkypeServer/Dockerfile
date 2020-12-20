#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
WORKDIR /src
COPY ["3DSkypeServer.csproj", "3DSkypeServer/"]
RUN dotnet restore "3DSkypeServer/3DSkypeServer.csproj"
WORKDIR "/src/3DSkypeServer"
COPY . .
RUN dotnet build "3DSkypeServer.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "3DSkypeServer.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
CMD ASPNETCORE_URLS=http://*:$PORT dotnet 3DSkypeServer.dll
