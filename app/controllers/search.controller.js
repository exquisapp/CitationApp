const ZoteroClient = require('zotero-translation-client');
const Cite = require('citation-js');

CSLTemplates = ["apa", "vancouver", "harvard1"];

const zConfig = {
    persist: false,
    translateURL: require('./../../config/API.config').translateURL
}

const formatOutput = (citation, format='html', template=CSLTemplates[0], lang="en-US") => {
    return citation.format('bibliography', {
        format,
        template,
        lang
    });
}

const isLikeURL = identifier => {
	return !!identifier.match(/^(https?:\/\/)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b(\S*)$/i);
};


module.exports = {
    handleEdit: async (req, res) => {
        const { json } = req.body;

        let newInfo = require('./../helpers/parseForCSL.handler').computeCiteJson(req.body.json);
        citation = await new Cite([newInfo]);
        output = await formatOutput(citation);
        console.log(json);
        return res.status(200).json({
            
            ...json,
            output,
        });
    },

    handleSearch: async (req, res, next) => {
        //evaluate format here
        try {
            let translationClient = new ZoteroClient(zConfig);
            const { query: { searchEntry }} = req;
            let citation, output, E;

            if (isLikeURL(searchEntry)){
                const { items: [ EntryInfo ] } = await translationClient.translateUrl(searchEntry);
                console.log('EntryInfo: ',EntryInfo)

                //cache E
                E = EntryInfo;

                let newInfo = require('./../helpers/parseForCSL.handler').computeCiteJson(EntryInfo);
                citation = await new Cite([newInfo]);
                output = await formatOutput(citation);
            } else {
                const translated = await translationClient.translateIdentifier(searchEntry);
                // citation = await new Cite(EntryInfo);
                // output = await formatOutput(citation);
                console.log('EntryInfo: ',translated)
                switch(translated.result){
                    case "COMPLETE": {
                        const { items: [ EntryInfo ]} = translated;
                        //if no item respond with no item

                        //cache E
                        E = EntryInfo;

                        if (translated.items.length === 0){
                            return res.status(200).json({empty: true})
                        }
                        let newInfo = require('./../helpers/parseForCSL.handler').computeCiteJson(EntryInfo);
                        citation = await new Cite([newInfo]);
                        output = await formatOutput(citation);
                        break;
                    }
                    case "MULTIPLE_CHOICES":{
                        output = {
                            message: "multiple choices"
                        }
                        return res.status(200).json({
                            multiple: true,
                            items: {...translated.items}
                        });
                    }
                    case "FAILED": {
                        output = { 
                            multiple: false,
                            message: `Error in citing ${searchEntry}`
                        }
                        break;
                    }
                    default: {
                        output = { 
                            multiple: false,
                            message: `Error in citing ${searchEntry}`}
                        break;
                    }
                }
               
            }

            return res.status(200).json({
                output, multiple: false,
                _d: E 
            });
        } catch (error){
            res.status(401).json({ error })
            console.log(error);
            next();
        }
    },


}