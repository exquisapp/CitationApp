$(document).ready(() => {
    //get from storage first
    const prevData = JSON.parse(localStorage.getItem('cw_data')) || [];


    prevData.forEach(data => {
      $('<div/>').html(`${data.output}`).appendTo($('.results'));
    });


    //add event listeners here
    (() => {
  
      //1
      $(".j-overlay").click(() => {
        //register all dynamic show and hide elements here
        $(".edit-citation").addClass("display-none");
        $(".multiple").addClass("display-none");
        $(".j-overlay").addClass("display-none");
      });


      //2
      $("#searchEntry").on('keypress', e => e.which === 13 ? citate(): null);
    
    })();
  });


  let currentCitation;

  //all functions
  function displayError(){
    $('#error-div').removeClass('display-none');

    setTimeout(() => {
        $('#error-div').addClass('display-none');
    }, 2400)
  }


  function makeNewJson(id){

    if(id.split('-')[0] === "creators"){
        
        let newCreators = [];
        
        let c = 0;
        currentCitation["creators"].forEach(k => {
            newCreators.push({
                ...k,
                [id.split('-')[2]]: parseInt(id.split('-')[1]) === c? $(`#${id}`)[0].value: k[id.split('-')[2]]
            });
            c++;
        
        })

        return currentCitation = {
            ...currentCitation,
            "creators": newCreators
        }
    }

    return currentCitation = {
        ...currentCitation,
        [id]: $(`#${id}`)[0].value
    }
  }

  function editCitation(id){
    console.log(id);
    
    $("#editM").click();
    //get from storage first
    const prevData = JSON.parse(localStorage.getItem('cw_data')) || [];

    //use current data as edit form
    console.log(prevData.filter(d => d.key === id));

    currentCitation = prevData.filter(d => d.key === id)[0];

    const editForm = $(".edit-form");

    //empty first
    editForm.html("");

    $.each(currentCitation, key => {
       const blackListedKeys = ["output", "key", "tags"];

       if (blackListedKeys.filter(a => a === key).length === 0){
        switch(currentCitation[key].constructor){
            case Array: 
                let c = 0;
                currentCitation[key].forEach(k => {
                    
                    $.each(k, l => {
                        if (k[l] !== "author"){
                            const hash = `creators-${c}-${l}`;
                            const template = `<input 
                            type="text" 
                            id="${hash}"
                            onkeyup="makeNewJson('${hash}')" 
                            class="form-control ${l}" 
                            placeholder="${l}"
                            value="${k[l]}">`; 
                            $('<div class="form-group"/>').html(template).appendTo(editForm);
                            
                        }
                          
                    });

                    c++;
                    
                });
                break;
            case Object:
                console.log("an object");
                break;
            case String:{
                console.log("strings, yes!");
                const template = `<input 
                onkeyup="makeNewJson('${key}')"
                type="text" 
                class="form-control" 
                id="${key}" 
                placeholder="${key}"
                value="${currentCitation[key]}">`; 
                $('<div class="form-group"/>').html(template).appendTo(editForm);
                break;
            }
        }
       }
    });


    

    (() => {
        
        $(".edit-it").click(() => {
            //listen for edit events
            //and edit

            console.log(currentCitation);

            (async () => {
                const rawResponse = await fetch('/api/edit', {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({json: currentCitation})
                });
                const content = await rawResponse.json();
                updateEdit(content);
                $('#modal-2-closer').click();
              })();
        });
    })(id)
  }

//   localStorage.clear();
  function deleteCitation(id){
    console.log(id);
    //get from storage first
    const prevData = JSON.parse(localStorage.getItem('cw_data')) || [];
    const newData = prevData.filter(d => d.key !== id);
    updateData(newData);
  }


// localStorage.clear()
  function updateData(data){
    localStorage.setItem('cw_data', JSON.stringify(data));
    $('.results').html("");
    //get from storage first
    const prevData = JSON.parse(localStorage.getItem('cw_data')) || [];
    prevData.forEach(data => {
      $('<div/>').html(`${data.output}`).appendTo($('.results'));
    });
  }

  function updateEdit(data){
    const prevData = JSON.parse(localStorage.getItem('cw_data')) || [];
    const newData = prevData.map(d => {
        if (d.key === data.key){
            let newOutput = `<div class="result">${data.output}
            <span style="padding: 6px; cursor: pointer" id="edit-${data.key}" onClick="editCitation('${data.key}')"><i class="ion-edit icon"></i></span> 
            <span style="padding: 6px; cursor: pointer" id="delete-${data.key}" onClick="deleteCitation('${data.key}')"><i class="ion-android-delete icon"></i></span>`;
            return {
                ...data,
                output: newOutput
            }
        }
        return d
    });

    

    updateData(newData);
  }



  function setLoading(truthy){
    if(truthy){
      return $('.spinner').removeClass('display-none');
    }
    return $('.spinner').addClass('display-none');
  }



  function storeLocally(data, output){
    //get from storage first
    const prevData = JSON.parse(localStorage.getItem('cw_data')) || [];
    prevData.push({...data, output});
    //store in local storage
    localStorage.setItem('cw_data', JSON.stringify(prevData));
  }



  function citateMulti(id){
    console.log(id);
    $("#modalC").click();
    $("#searchEntry").val('');
    $("#searchEntry").val(id);
    citate(); 
  }

  function citate() {
    let currentMultipleData = {};
    console.log($("#searchEntry").val());
    const searchEntry = $("#searchEntry").val();
    
    //sets loading true
    setLoading(true);
    if (searchEntry){
        fetch(`/api/search?searchEntry=${searchEntry}`)
      .then(res => {
        console.log(res);
        return res.json();
      })
      .then(data => {
        console.log(data);



        if (data.empty){

        //show html that it is an empty result  
        displayError();
        setLoading(false);    

        return;
        } else {

          //if not empty
          if (data.multiple) {
              
            $('#modalClick').click();
          
          const cList = $(".multi");
          cList.html("");
          $.each(data.items, i => {


            const eachItem = $(`<div onClick="citateMulti(${i})"/>`)
                .addClass(`col select-con`)              
                .html(
                  `<div class="modal-con">
                <div>
                    <img src="./img/reading.jpg" width="100px" alt="">
                </div>
                <div>
                    <h4 class="ml-4">${data.items[i].title}</h4>
                    <p>${data.items[i].description}</p>
                    <p>Type: ${data.items[i].itemType}</p>
                </div>  
                </div>`)
                .addClass(`call-${i}`)
                .appendTo(cList);
            });
          }

          
            

          if (!data.multiple) {
            let newOutput = `<div class="result">${data.output}
            <span style="padding: 6px; cursor: pointer" id="edit-${data._d.key}" onClick="editCitation('${data._d.key}')"><i class="ion-edit icon"></i></span> 
            <span style="padding: 6px; cursor: pointer" id="delete-${data._d.key}" onClick="deleteCitation('${data._d.key}')"><i class="ion-android-delete icon"></i></span>`;

            storeLocally(data._d, newOutput);

            $('<div/>').html(newOutput).appendTo($('.results'))

            $("#searchEntry").val('');
          } 


        }

        setLoading(false);
        
      })
      .catch(error => {
        console.log(error);
        displayError();
        setLoading(false);
         //show error html with display none and all
      });
    } else {
        //sets loading true
        setLoading(false);
    }
     

  }