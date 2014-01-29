/*!
*
*   APP
*
*/

window.modules = window.modules || {};
// window.objects = window.objects || {};
// window.data = window.data || {};

$(function(){

    console.log('******************')
    console.log('*  Starting App  *')
    console.log('******************')

    window.webSocketChannel = window.webSocketChannel || 'loading';
    window.modules.ws.subscribeToChannel(window.webSocketChannel);
    window.modules.ws.addListener(['desync', 'resync', 'reset'], globalEvents);


    function globalEvents(message){
        //console.log('WS Global:', message);

        switch(message.event){
            case 'desync':
            case 'resync':
            case 'reset':
                window.modules.util.reloadDelayed();
                break;
        }
    }


});