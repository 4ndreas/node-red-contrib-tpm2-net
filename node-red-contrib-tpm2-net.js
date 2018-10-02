const tpm2 = require('tpm2-net-node');


module.exports = function (RED) {
    function tpm2OutNode(config) {
        RED.nodes.createNode(this, config);
        this.flowContext = this.context().global;

        this.name = config.name;
        this.address = config.address;
        this.port = config.port || 65506;
        this.size = config.size;

        this.nodeData = this.flowContext.get("nodeData") || [];
        this.client = tpm2.Client.createClient(this.address, this.port, this.size);

        var node = this;

        this.saveDataToContext = function () {
            node.flowContext.set("nodeData", node.nodeData);
        };

        this.sendData = function () {
            node.client.send(node.nodeData);
        };

        this.get = function (address) {
            return parseInt(node.nodeData[address - 1] || 0);
        };

        this.on("close", function () {
            node.clearTransitions();
            node.saveDataToContext();
        });

        this.on('input', function (msg) {
            var payload = msg.payload;
            node.nodeData = payload;
            node.sendData();
        });

        this.clearTransitions = function (channel, skipDataSending) {
            node.client.close();
        };        
    }

    RED.nodes.registerType("tpm2 out", tpm2OutNode);
};