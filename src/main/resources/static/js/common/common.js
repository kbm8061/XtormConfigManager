$(document).ready(function () {
    $(document).on('click', '#input-conf-file-add', function() {
        let fileInput = document.getElementById('input-conf-file');

        if (fileInput.files[0]) {
            let fileReader = new FileReader();
            fileReader.onload = function(event) {
                let xmlData = event.target.result;
                let jsonData = parseXml(xmlData);
                createCard(jsonData);
            };
            fileReader.readAsText(fileInput.files[0]);
        } else {
            alert('파일을 선택해주세요.');
        }
    });

    $(document).on('click', '#btn-add-sample', function () {
        let param = {};
        param.class = $('#select-sample').val();

        $.ajax({
            url: "/select/data",
            method: "POST",
            data: JSON.stringify(param),
            contentType: "application/json;charset=UTF-8",
            success: function (response) {
                const data = JSON.parse(response);
                createCard(data);
            },
            error: function (xhr) {
                alert(xhr.responseText);
            }
        });
    });

    $(document).on('click', '#btn-add-logwriter', function () {
        let param = {};
        param.class = $('#select-server-logwriter').val();

        $.ajax({
            url: "/select/data",
            method: "POST",
            data: JSON.stringify(param),
            contentType: "application/json;charset=UTF-8",
            success: function (response) {
                const data = JSON.parse(response);
                createCard(data);
            },
            error: function (xhr) {
                alert(xhr.responseText);
            }
        });
    });

    $(document).on('click', '#btn-add-agent', function () {
        let param = {};
        param.class = $('#select-localagents-agent').val();

        $.ajax({
            url: "/select/data",
            method: "POST",
            data: JSON.stringify(param),
            contentType: "application/json;charset=UTF-8",
            success: function (response) {
                const data = JSON.parse(response);
                createCard(data);
            },
            error: function (xhr) {
                alert(xhr.responseText);
            }
        });
    });

    $(document).on('click', '#btn-add-externserver', function () {
        let param = {};
        param.class = $('#select-serverlist-externserver').val();

        $.ajax({
            url: "/select/data",
            method: "POST",
            data: JSON.stringify(param),
            contentType: "application/json;charset=UTF-8",
            success: function (response) {
                const data = JSON.parse(response);
                createCard(data);
            },
            error: function (xhr) {
                alert(xhr.responseText);
            }
        });
    });

    function createCard(data) {
        if (data['xvarm']) {
            appendDataToRoot(data['xvarm']);
        }
        if (data['server']) {
            appendDataToArea(data['server'], '#area-server');
        }
        if (data['localagents']) {
            appendDataToArea(data['localagents'], '#area-localagents');
        }
        if (data['serverlist']) {
            appendDataToArea(data['serverlist'], '#area-serverlist');
        }
    }

    function appendDataToRoot(data) {
        const $targetArea = $('#area-xvarm');
        $targetArea.empty();

        Object.keys(data).forEach(key => {
            const $childCard = createChildCard(key, data[key]);
            $targetArea.append($childCard);
        });
    }

    function appendDataToArea(data, areaId) {
        const $targetArea = $(areaId);

        Object.keys(data).forEach(key => {
            const $childCard = createChildCard(key, data[key]);
            $targetArea.append($childCard);
        });
    }

    function createInputField(label, value) {
        const $div = $('<div>').addClass('input-group input-group-sm my-1');
        const cleanLabel = label.startsWith('@') ? label.substring(1) : label;
        $div.append($('<span>').addClass('input-group-text w-10').text(cleanLabel));

        if (Array.isArray(value)) {
            const $select = $('<select>').addClass('form-select');
            value.forEach(optionValue => {
                $select.append($('<option>').val(optionValue).text(optionValue));
            });
            $div.append($select);
        } else if (typeof value === 'object') {
            return createChildCard(label, value);
        } else {
            $div.append($('<input>').addClass('form-control').val(value));
        }

        return $div;
    }

    function createChildCard(childKey, childData) {
        const $childCard = $('<div>').addClass('card my-1');
        const cleanChildKey = childKey.startsWith('@') ? childKey.substring(1) : childKey;

        const $cardHeader = $('<div>').addClass('card-header').text(cleanChildKey);

        if (childKey === 'logwriter' || childKey === 'agent' || childKey === 'externserver') {
            const $removeButton = $('<button>').addClass('btn btn-outline-secondary btn-sm float-end').html('<i class="fa-solid fa-minus"></i>');
            $cardHeader.append($removeButton);
            $removeButton.on('click', function () {
                $childCard.remove();
            });
        }

        $childCard.append($cardHeader);

        const $childCardBody = $('<div>').addClass('card-body')

        if (childKey === 'server' || childKey === 'localagents' || childKey === 'serverlist') {
            $childCardBody.attr('id', 'area-' + childKey);
        }

        $childCard.append($childCardBody);

        if (childData['@attributes']) {
            Object.keys(childData['@attributes']).forEach(attrKey => {
                $childCardBody.append(createInputField(attrKey, childData['@attributes'][attrKey]));
            });
        }

        Object.keys(childData).forEach(key => {
            if (key !== '@attributes') {
                if (typeof childData[key] === 'object') {
                    $childCardBody.append(createChildCard(key, childData[key]));
                } else {
                    $childCardBody.append(createInputField(key, childData[key]));
                }
            }
        });

        return $childCard;
    }

    function parseXml(xml) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(xml, "text/xml");
        return xmlToJson(xmlDoc);
    }

    function xmlToJson(xml) {
        let obj = {};
        if (xml.nodeType === 1) {
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (let j = 0; j < xml.attributes.length; j++) {
                    let attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType === 3) {
            obj = xml.nodeValue.trim();
        }

        if (xml.hasChildNodes()) {
            for (let i = 0; i < xml.childNodes.length; i++) {
                let item = xml.childNodes.item(i);
                if (item.nodeType === 3 && item.nodeValue.trim() === '') continue;
                if (item.nodeType === 8) continue;

                let nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].push) == "undefined") {
                        let old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(xmlToJson(item));
                }
            }
        }
        return obj;
    }
});