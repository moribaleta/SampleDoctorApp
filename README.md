## Getting Started

this is sample doctor scheduler appointment

## Features

- view doctor schedule appointment
- booked appointments
  - cannot book timeslot with the same dayOfWeek and timeslot
- able to view the scheduled appointments
- able to cancel scheduled appointments
- offline feature (saving scheduled appointments in device)

## Running the app

- Install the dependencies:

  ```sh
  cd DocViewer
  ```

  ```sh
  npx expo install
  ```

  ```sh
  npm i
  ```

- Start the development server:

  ```sh
  npx expo start
  ```

- Build and run iOS and Android development builds:

  ```sh
  npm run ios
  # or
  npm run android
  ```

- In the terminal running the development server, press `i` to open the iOS simulator, `a` to open the Android device or emulator, or `w` to open the web browser.

## Resources

- [React Navigation documentation](https://reactnavigation.org/)
- [Expo documentation](https://docs.expo.dev/)
- [@tanstack/react-query](https://tanstack.com/query)
- [React Navigation](https://reactnavigation.org/)
- [Async Storage](https://github.com/react-native-async-storage/async-storage)
- [Jest](https://jestjs.io/)
- [React Testing Library / React Native](https://testing-library.com/docs/react-testing-library/intro/)

---

## Assumption & Design Decisions

- Uses expo as this is more comprehensive in setting up and supports for web version (quicker to build and test compare to Android and IOS)
- Uses tanstack/react-query for data flow, this tool is used throughout the whole application to manage datastate within the business logic of application, this tool provides caching and refetch capabilities that are easier to use than other tools
- Uses localStorage as the source of truth for booked schedule, this is to easily manage data without trying to sync both in memory and local storage

## Known Limitation & Future Enhancement

- currently the list doesnt support any pagination, data are received as is, if the raw data becomes too long ie 100> rows this might cause some lag to the application
- no online syncing feature to the app, booked schedules are offline only, if the user deletes the app, there are no backups that can restore the data
- no login feature yet everything is offline and stored locally
