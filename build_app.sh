#!/bin/bash
set -x # echo on
set -e # exit when any command fails

SELF_PATH=$(realpath "$0")
WORKDIR=$(dirname "${SELF_PATH}")
cd "${WORKDIR}"

export BUILDFOLDER="${WORKDIR}/build"
export WORKSPACEFOLDER="${BUILDFOLDER}/ws"
export APPFOLDER="${BUILDFOLDER}/app"
export EXPORTFOLDER="${BUILDFOLDER}/export"
export OUTFOLDER="${BUILDFOLDER}/out"
mkdir -p "${BUILDFOLDER}" "${OUTFOLDER}"

export YAMLFILE="${WORKDIR}/docker-compose.yml"
export ICONPATH="${WORKDIR}/docs/graphics/icon.png"
export APPREPONAME="mtarchandvis"
export APPNAME="Archiving and Visualization"
export APPDESC="Archive and show tags values from IE Databus"
export APPID="tf2kycZ2LjFbL85hlfdrppdFFgvXgJ5y"

export SERVICENAME1="grafana"
export SERVICEPORT1="3000"
export DOCKER_APP_IMG_NAME1="${SERVICENAME1}_edge:0.0.1"
export DOCKERIMAGEFILE1="${BUILDFOLDER}/${SERVICENAME1}_dockerimage.tar"

export SERVICENAME2="influxdb"
export DOCKER_APP_IMG_NAME2="${SERVICENAME2}_edge:0.0.1"
export DOCKERIMAGEFILE2="${BUILDFOLDER}/${SERVICENAME2}_dockerimage.tar"

export SERVICENAME3="datacollector"
export DOCKER_APP_IMG_NAME3="data-collector_edge:0.0.2"
export DOCKERIMAGEFILE3="${BUILDFOLDER}/${SERVICENAME3}_dockerimage.tar"

SERVICE_TO_IMAGE_JSON="{ \"${SERVICENAME1}\": \"${DOCKERIMAGEFILE1}\", \"${SERVICENAME2}\": \"${DOCKERIMAGEFILE2}\", \"${SERVICENAME3}\": \"${DOCKERIMAGEFILE3}\"}"

export PRODHUB_HOSTPATH="portalhub.eu1.edge.siemens.cloud/${APPREPONAME}"
export APPPUB=ie-app-publisher-linux

export GIT_FULL_VERSION="$(git describe --always --tags --dirty)"
if [ -z "${APPVERSION}" ] ; then
    export APPVERSION="$(echo ${GIT_FULL_VERSION} | sed -E -e 's/^[vV]?([^-]+(-[0-9]+))?.*$/\1/')"
fi

export APPNAME_NO_SPACE=$(echo "${APPNAME}" | tr ' ' '_')

export IMAGE_ID1=$(docker inspect -f '{{.ID}}' "${DOCKER_APP_IMG_NAME1}" | sed -E -e "s/^[^:]+:([0-9a-fA-F]{12}).*$/\1/")
export DOCKER_IMG_NAME_WITH_ID1=$(echo "${DOCKER_APP_IMG_NAME1}" | sed -e "s|^.*/||" -e "s|:.*$||"):${IMAGE_ID1}
export DOCKER_IMG_NAME_FULL1="${PRODHUB_HOSTPATH}/${DOCKER_IMG_NAME_WITH_ID1}"
docker image tag "${DOCKER_APP_IMG_NAME1}" "${DOCKER_IMG_NAME_FULL1}"
docker image save -o "${DOCKERIMAGEFILE1}" "${DOCKER_APP_IMG_NAME1}"

export IMAGE_ID2=$(docker inspect -f '{{.ID}}' "${DOCKER_APP_IMG_NAME2}" | sed -E -e "s/^[^:]+:([0-9a-fA-F]{12}).*$/\1/")
export DOCKER_IMG_NAME_WITH_ID2=$(echo "${DOCKER_APP_IMG_NAME2}" | sed -e "s|^.*/||" -e "s|:.*$||"):${IMAGE_ID2}
export DOCKER_IMG_NAME_FULL2="${PRODHUB_HOSTPATH}/${DOCKER_IMG_NAME_WITH_ID2}"
docker image tag "${DOCKER_APP_IMG_NAME2}" "${DOCKER_IMG_NAME_FULL2}"
docker image save -o "${DOCKERIMAGEFILE2}" "${DOCKER_APP_IMG_NAME2}"

export IMAGE_ID3=$(docker inspect -f '{{.ID}}' "${DOCKER_APP_IMG_NAME3}" | sed -E -e "s/^[^:]+:([0-9a-fA-F]{12}).*$/\1/")
export DOCKER_IMG_NAME_WITH_ID3=$(echo "${DOCKER_APP_IMG_NAME3}" | sed -e "s|^.*/||" -e "s|:.*$||"):${IMAGE_ID3}
export DOCKER_IMG_NAME_FULL3="${PRODHUB_HOSTPATH}/${DOCKER_IMG_NAME_WITH_ID3}"
docker image tag "${DOCKER_APP_IMG_NAME3}" "${DOCKER_IMG_NAME_FULL3}"
docker image save -o "${DOCKERIMAGEFILE3}" "${DOCKER_APP_IMG_NAME3}"

#printenv | sed -e 's/\(\(KEY\|PASSWORD\|TOKEN|AUTH_CONFIG|JWT\)=\)\(.*\)/\1[MASKED]/'

rm -rf "${WORKSPACEFOLDER}" "${APPFOLDER}" "${EXPORTFOLDER}"
mkdir -p "${WORKSPACEFOLDER}" "${APPFOLDER}" "${EXPORTFOLDER}"
cd "${WORKSPACEFOLDER}"
$APPPUB ws init .

# replace the docker image name in the docker-compose.yaml including the tag
cp "${YAMLFILE}" "${APPFOLDER}/docker-compose.yml"
yq -i ".services.${SERVICENAME1}.image=\"${DOCKER_IMG_NAME_FULL1}\"" "${APPFOLDER}/docker-compose.yml"
yq -i ".services.${SERVICENAME2}.image=\"${DOCKER_IMG_NAME_FULL2}\"" "${APPFOLDER}/docker-compose.yml"
yq -i ".services.${SERVICENAME3}.image=\"${DOCKER_IMG_NAME_FULL3}\"" "${APPFOLDER}/docker-compose.yml"
yq -i 'del(.services.[].build)' "${APPFOLDER}/docker-compose.yml"

# call app publisher to create the app file
$APPPUB sa create -a "${APPNAME}" -r "${APPREPONAME}" -d "${APPDESC}" -i "${ICONPATH}" -p "${APPID}"

$APPPUB sa addsaconfiguration --verbose -a "${APPNAME}" -n "Configuration" -d "JSONForms Configuration" -p "./cfg-data/" -x -t "JSONForms" -e "JSONForms Configuration" -f "${WORKDIR}/src/data-collector/config/config.json" -j

$APPPUB sa createversion --verbose -a "${APPNAME}" -v "${APPVERSION}" -y "${APPFOLDER}/docker-compose.yml" -j "${SERVICE_TO_IMAGE_JSON}" -n "{\"${SERVICENAME1}\":[{\"name\":\"${SERVICENAME1}\",\"protocol\":\"HTTP\",\"port\":\"${SERVICEPORT1}\",\"headers\":\"{\\\"proxy_cache_revalidate\\\":\\\"on\\\",\\\"proxy_cache_valid\\\":\\\"5m\\\"}\",\"rewriteTarget\":\"/\", \"isSecureRedirection\":false}]}" -s "${SERVICENAME1}" -t "FromBoxReverseProxy" -u "${SERVICENAME1}/" -r ""

$APPPUB sa exportversion --verbose -a "${APPNAME}" -v "${APPVERSION}" -e "${EXPORTFOLDER}" -s "${SERVICENAME1}" -t "FromBoxReverseProxy" -u "${SERVICENAME1}/"

mv ${EXPORTFOLDER}/*.app "${OUTFOLDER}/${APPNAME_NO_SPACE}_${APPVERSION}.app"
