const initConfirmModal = async (objectId, ids, action, objectName) => {
    var alert = new bootstrap.Modal($(objectId + '-confirm-modal'));

    $(alert._element).on('show.bs.modal', function () {
        $(objectId + '-confirm-modal .modal-body').text('Are you sure you want to ' + action + ' ' + ids.length + ' ' + objectName + (ids.length > 1 ? 's' : '') + '?');
        if (action == 'remove')$(objectId + '-confirm-modal .modal-body').append('<br><br><strong>Warning:</strong> This action cannot be undone.');
        if (action == 'disable')$(objectId + '-confirm-modal .modal-body').append('<br><br><strong>Attention:</strong> Disabling a record can take up to 5 minutes to become effective.');
        $(objectId + '-confirm-modal .modal-title').text('Confirm')
    })
    alert.show();

    let result = await new Promise((resolve, reject) => {
        $(objectId + '-confirm-modal .save-button').click(function () {
            resolve(true);
        });
        $(objectId + '-confirm-modal .cancel-button').click(function () {
            resolve(false);
        });
    });

    alert.hide();
    return result;

}

const initEditModal = async (objectId, row, objectName, newRow, columns) => {

    var edit = new bootstrap.Modal($(objectId + '-edit-modal'));

    $(edit._element).on('show.bs.modal', function () {

        $(objectId + '-edit-modal .modal-title').text(newRow ? 'Add new ' + objectName : 'Edit ' + objectName)

        // Create each input field
        for (var key in row) {
            if (row.hasOwnProperty(key)) {
                if (key == 'state'){continue}
                $(objectId + '-edit-modal .modal-body')
                        .append('<label for="' + key + '" class="col-form-label strong">' + key + '</label><input type="text" class="form-control" id="' + key + '" placeholder="' + key + '" value="' + row[key] + '">')
            
                if (key == 'id') {
                    $('#' + key).prop('disabled', true)
                }
                // Search key in columns object 
                columns.forEach(function(column) {
                    if (column.field == key) {
                        if (column.class) {
                            var classes = column.class.split(' ');
                            classes.forEach(function(className) {
                                if (className == 'disabled') {
                                    $('#' + key).prop('disabled', true)
                                }
                            });
                        }
                    }
                });
            }
        }

        // Fill modal with all row data inside a loop
        for (var key in row) {
            if (row.hasOwnProperty(key)) {
                $('#' + key).val(row[key])
            }
        }
    })

    $(edit._element).on('hide.bs.modal', function () {
        // Remove all input fields
        $(objectId + '-edit-modal .modal-body').empty();

        // Remove row data
        row = {}
    });

    edit.show();

    let result = await new Promise((resolve) => {
        $(objectId + '-edit-modal .save-button').click(function () {
            // Create a new row object and fill it with modal form inputs
            let editedRow = {}
            for (var key in row) {
                if (key == 'state'){continue}
                if (row.hasOwnProperty(key)) {
                    editedRow[key] = $('#' + key).val()
                }
            }
            resolve(editedRow);
        });
        $(objectId + '-edit-modal .cancel-button').click(function () {
            resolve(null);
        });
    });

    edit.hide();
    return result;

}

const initAlertModal = async (objectId, message, timeout = 3000) => {

    console.log('initAlertModal', objectId + '-alert-modal', message, timeout);
    var alert = new bootstrap.Modal($(objectId + '-alert-modal'));

    $(alert._element).on('show.bs.modal', function () {
        $(objectId + '-alert-modal .alert ').text(message)
    })
    alert.show();

    await new Promise((resolve) => {
        $(objectId + '-alert-modal .save-button').click(function () {
            resolve(true);
        });
        // wait 3 seconds before closing
        if (timeout < 0) {
            setTimeout(() => {
                resolve(true);
            }, timeout);
        }
        });

    alert.hide();
}

const initMessageModal = async (objectId, message, title) => {
    var alert = new bootstrap.Modal($(objectId + '-message-modal'));

    $(alert._element).on('show.bs.modal', function () {
        $(objectId + '-message-modal .modal-body').text(message);
        $(objectId + '-message-modal .modal-title').text(title)
    })
    alert.show();

    let result = await new Promise((resolve, reject) => {
        $(objectId + '-message-modal .save-button').click(function () {
            resolve(true);
        });
    });

    alert.hide();
    return result;

}