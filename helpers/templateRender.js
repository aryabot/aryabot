var TemplateRender = {
    render: function(template, data) {
        if (data.cab_name) {
            template = template.replace('__cab_name__', data.cab_name);
        }

        if (data.time) {
            var time_in_minutes = data.time / 60;
            template = template.replace('__time__', time_in_minutes);
        }

        return template;
    }
};

module.exports.TemplateRender = TemplateRender;
