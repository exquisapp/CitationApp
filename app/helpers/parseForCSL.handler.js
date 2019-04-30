
module.exports = {
    computeCiteJson: citation => {
        let newCitation = {};

        if (citation.creators.length > 0){
            newCitation.author = citation.creators.reduce((acc, current) => {
                acc.push({
                    given: current.firstName,
                    family: current.lastName
                });
                return acc;
            }, [])
        }

        if (citation.itemType){
            newCitation.type = citation.itemType;
        }
        newCitation.issued = [{
            "date-parts": [citation.date ]
        }]

        newCitation.issue = citation.version
        newCitation.location = citation.place;
        newCitation.accessed = citation.accessDate;
        newCitation.publisher = citation.websiteTitle;
        newCitation.URL = citation.url;
        delete citation.version;
        console.log({...newCitation, ...citation});
        return {...newCitation, ...citation};

    }
}