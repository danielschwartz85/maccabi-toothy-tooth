# Maccabi Toothy Tooth (shinnanit) 🦷

## Simple Run

To get the next available _"shinnanit"_ appointments, run:

```sh
npx maccabi-toothy-tooth
```

Select city:

![CLI Example](./cli1.png)

Select the number of days and that's it!:

![CLI Example](./cli2.png)

_* Showing results from the surrounding areas._

## Script Run with Arguments

```
npx maccabi-toothy-tooth [-c <clinicId>] [-n <numOfDays>] [-rtl] [--help] [--version]
```

* If `numOfDays` or `clinicId` are missing, then they will be prompted for.
* For a full list of Clinic Ids [Go here.](CLINICS.md)
* If you are using a terminal that does not support RTL then the text would be displayed in reveres. you can set `-rtl` to fix this issue.
