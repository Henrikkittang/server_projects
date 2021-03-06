module.exports = (app, profiles) => {
    require('./files')(app);
    require('./authentication')(app, profiles);
}