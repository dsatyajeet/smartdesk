/**
 * Created by ajitmogre on 01/12/15.
 */
function toggle(id1,id2){
    $(id1).show();
    $(id2).hide();
}

function addNotification(message,type){

        var n = noty({
            text        : message,
            type        : type,
            dismissQueue: true,
            layout      : 'topRight',
            closeWith   : ['click'],
            theme       : 'relax',
            maxVisible  : 10,
            animation   : {
                open  : 'animated bounceInRight',
                close : 'animated bounceOutRight',
                easing: 'swing',
                speed : 500
            }
        });
        console.log('html: ' + n.options.id);

}
