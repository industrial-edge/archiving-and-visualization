# Archiving & Visualization Demo

Archiving and Visualization Panel demo application for Industrial Edge

- [Archiving & Visualization Demo](#archiving--visualization-demo)
  - [Description](#description)
    - [Overview](#overview)
    - [General Task](#general-task)
  - [Requirements](#requirements)
    - [Components](#components)
    - [Helpful tools](#helpful-tools)
    - [TIA Project](#tia-project)
  - [Prerequisite](#prerequisite)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Information](#information)
  - [Documentation](#documentation)
  - [Contribution](#contribution)
  - [License & Legal Information](#license--legal-information)

## Description

### Overview

The Industrial Edge Application "Archiving & Visualization Demo" is based on a bottle filling process application from which data values are collected, stored in an Influxdb database and visualized with a Grafana dashboard.

![overview](docs/graphics/overview.png)

### General Task

The Industrial Edge Application "Archiving & Visualization Demo" collects data from an S7-1500 PLC using the S7 Connector System Application. The collected data is automatically published to the IE Databus which is an internal MQTT broker of the Edge Runtime. The "Archiving & Visualization Demo" Application uses an MQTT Client (Datacollector) to subscribe to the IE Databus and write these values into an Influx-Database. The time series of the collected data can then be plotted with grafana.

## Requirements

### Components

- OS: Windows or Linux
- Docker minimum V18.09
- Docker Compose V2.0 – V2.4
- Industrial Edge App Publisher (IEAP) V1.2.8
- Industrial Edge Management (IEM) V1.2.16
  - S7 Connector V1.2.26
  - S7 Connector Configurator V1.2.38
  - IE Databus V1.2.16
  - IE Databus Configurator V1.2.29
  - IE App Configuration Service V1.0.5
- Industrial Edge Device (IED) V1.2.0-56
- TIA Portal V16
- PLC: CPU 1511 FW 2.8.3

### Helpful tools

- Any development environment (e.g. Visual Studio Code, Eclipse, …)
- Docker Extension for your development environment e.g. Visual Studio Code Extension

### TIA Project

The used TIA Portal project can be found in the [miscellaneous repository](https://github.com/industrial-edge/miscellaneous) in the tank application folder and is also used for several further application examples:

- [Tia Tank Application](https://github.com/industrial-edge/miscellaneous/tree/main/tank%20application)

## Prerequisite

Use SIMATIC S7 Connector in bulk publish mode to collect datapoints from the Demo project "Tank Application". Name the PLC "PLC_1" and select following Datapoints using the Browse functionality:

- GDB_signals_tankSignals_actLevel (Read/100ms)
- GDB_signals_tankSignals_actTemperature (Read/100ms)
- GDB_process_numberProduced (Read/100ms)
- GDB_process_numberFaulty (Read/100ms)
- GDB_hmiSignals_HMI_Nextbottle (Read&Write/100ms)

The IE Databus is configured with one topic:
ie/#
username: edge
password: edge

## Installation

For a Step-by-Step guide on how to install this Industrial Edge Application, follow the **[installation instructions](docs/installation.md)**

## Usage

### Information

> :warning: This application exposes accessible API endpoints protected by username and password. Protect your Industrial Edge Device from unauthorized access and don't share your API username and password. This application is only a How To and is not designed to be used in a production enviroment.

## Documentation

- You can find further documentation and help in the following links
  - [Industrial Edge Hub](https://iehub.eu1.edge.siemens.cloud/#/documentation)
  - [Industrial Edge Forum](https://www.siemens.com/industrial-edge-forum)
  - [Industrial Edge landing page](https://new.siemens.com/global/en/products/automation/topic-areas/industrial-edge/simatic-edge.html)
  
## Contribution

Thank you for your interest in contributing. Anybody is free to report bugs, unclear documentation, and other problems regarding this repository in the Issues section.
Additionally everybody is free to propose any changes to this repository using Pull Requests.

If you are interested in contributing via Pull Request, please check the [Contribution License Agreement](Siemens_CLA_1.1.pdf) and forward a signed copy to [industrialedge.industry@siemens.com](mailto:industrialedge.industry@siemens.com?subject=CLA%20Agreement%20Industrial-Edge).

## License & Legal Information

Please read the [Legal information](LICENSE.md).
