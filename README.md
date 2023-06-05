# Archiving & Visualization Demo

Archiving and visualization demo application for Industrial Edge

- [Archiving \& Visualization Demo](#archiving--visualization-demo)
  - [Description](#description)
    - [Overview](#overview)
    - [General Task](#general-task)
  - [Requirements](#requirements)
    - [Used Components](#used-components)
    - [TIA Project](#tia-project)
    - [Helpful tools](#helpful-tools)
  - [Prerequisite](#prerequisite)
  - [Installation](#installation)
  - [Documentation](#documentation)
  - [Contribution](#contribution)
  - [License \& Legal Information](#license--legal-information)
  - [Disclaimer](#disclaimer)

## Description

### Overview

The Industrial Edge Application "Archiving & Visualization Demo" is based on a bottle filling process application from which data values are collected, stored in an InfluxDB database and visualized in a InfluxDB dashboard.

![overview](docs/graphics/overview.png)

### General Task

The Industrial Edge Application "Archiving & Visualization" collects data from an S7-1500 PLC using the OPC UA Connector application. The collected data is automatically published to the Databus which is an internal MQTT broker of the Edge Runtime. The Application uses an MQTT Client (data-collector) to subscribe to the Databus and write these values into an InfluxDB database. The time series of the collected data can then be plotted with InfluxDB dashboards.

You can find the further information about the application [here](docs/overview.md)

## Requirements

### Used Components

- OS: Windows or Linux
- Docker minimum V18.09
- Docker Compose V2.0 – V2.12.2
- Industrial Edge App Publisher (IEAP) &geq; V1.7.1
- Industrial Edge Management (IEM) V1.10.3
  - Common Connector Configurator V1.8.1-4 
  - OPC UA Connector V1.8.1-6
  - Databus V2.1.0-4
  - Databus Configurator V2.1.0-3
  - IE App Configuration Service V1.2.2
- Industrial Edge Device (IEvD) V1.10.0-6-a
- TIA Portal &geq; V16
- PLC: CPU 1512 FW 2.8.3

### TIA Project

The used TIA Portal project can be found in the [miscellaneous repository](https://github.com/industrial-edge/miscellaneous) in the tank application folder and is also used for several further application examples:

- [Tia Tank Application](https://github.com/industrial-edge/miscellaneous/tree/main/tank%20application)

### Helpful tools

- Any development environment (e.g. Visual Studio Code, Eclipse, …)
- Docker Extension for your development environment e.g. Visual Studio Code Extension

## Prerequisite
Use OPC UA Connector in bulk publish mode to collect datapoints from the Application example "Tank Application". Name the Data Source "Tank" and select following Datapoints using the Browse functionality:

* GDB_signals_tankSignals_actLevel (Read/100ms)
* GDB_signals_tankSignals_actTemperature (Read/100ms)
* GDB_process_numberProduced (Read/100ms)
* GDB_process_numberFaulty (Read/100ms)
* GDB_hmiSignals_HMI_Nextbottle (Read&Write/100ms)

The Databus is configured with one topic: `ie/#` username: `edge` password: `edge`

<details>
  <summary>
    In case of browse timeout you can also add the tags manually
<small><i>Click to show/collapse.</i></small>
  </summary>

* `n=3;s="GDB"."signals"."tankSignals"."actLevel"`
* `n=3;s="GDB"."signals"."tankSignals"."actTemperature"`  
* `n=3;s="GDB"."process"."numberProduced"` 
* `n=3;s="GDB"."process"."numberFaulty"`
* `n=3;s="GDB"."hmiSignals"."HMI"."NextBottle"`

</details>

## Installation

You can find the further information about the following steps in the [docs](docs/installation.md)

- [Build application](docs/installation.md#build-application)
- [Upload application to Industrial Edge Management](docs/installation.md#upload-application-to-industrial-edge-management)
- [Configure and install application to Industrial Edge Device](docs/installation.md#install-application-on-industrial-edge-device)

## Documentation

- Here is a link to the [docs](docs/) of this application example.
- You can find further documentation and help in the following links
  - [Industrial Edge Hub](https://iehub.eu1.edge.siemens.cloud/#/documentation)
  - [Industrial Edge Forum](https://www.siemens.com/industrial-edge-forum)
  - [Industrial Edge Landing page](https://www.siemens.com/global/en/products/automation/topic-areas/industrial-edge/production-machines.html)
  - [Industrial Edge Documentation](https://industrial-edge.io/)
  
## Contribution

Thank you for your interest in contributing. Anybody is free to report bugs, unclear documentation, and other problems regarding this repository in the Issues section.
Additionally everybody is free to propose any changes to this repository using Pull Requests.

If you are interested in contributing via Pull Request, please check the [Contribution License Agreement](Siemens_CLA_1.1.pdf) and forward a signed copy to [industrialedge.industry@siemens.com](mailto:industrialedge.industry@siemens.com?subject=CLA%20Agreement%20Industrial-Edge).

## License & Legal Information

Please read the [Legal information](LICENSE.md).

## Disclaimer

IMPORTANT - PLEASE READ CAREFULLY:

This documentation describes how you can download and set up containers which consist of or contain third-party software. By following this documentation you agree that using such third-party software is done at your own discretion and risk. No advice or information, whether oral or written, obtained by you from us or from this documentation shall create any warranty for the third-party software. Additionally, by following these descriptions or using the contents of this documentation, you agree that you are responsible for complying with all third party licenses applicable to such third-party software. All product names, logos, and brands are property of their respective owners. All third-party company, product and service names used in this documentation are for identification purposes only. Use of these names, logos, and brands does not imply endorsement.