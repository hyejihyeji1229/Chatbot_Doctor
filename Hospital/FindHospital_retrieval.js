"use strict"

var FBTemplate = require('../FacebookTemplate.js')
var express = require("express");
var mysql = require('mysql');
var connection = mysql.createConnection({
    // connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'Sidomari93',
    database: 'medicine_test'
});


var Hospital_arr = [];
var searching_Hospital = '';

function hitQuery(disease_name) {
    return new Promise((resolve, reject) => {
        //var sql2 = 'select * from professors where dept_id = (select dept_id from diseases where name = '+ disease_name +') or dept_id in (select dept_id from professors where major like ' +"'%" + disease_name + "%')"
        //select * from professors where dept_id = (select dept_id from diseases where name = '대장항문외과') or dept_id in (select dept_id from professors where major like '%대장항문외과%');

        var sql = 'SELECT * FROM professors WHERE major like ' +"'%" + disease_name +"%'";
        connection.query(sql, (err, rows) => {
            Hospital_arr = rows;
            console.log(rows);
            console.log(sql);        
            console.log('========================================');

            resolve();
        });
        // connection.release();
    });

}

module.exports = {

    metadata: () => ({
        "name": "FindHospitalRetrieval",
        "properties": {
            " disease": { "type": "string", "required": true }
        },
        "supportedActions": []
    }),

    invoke: (conversation, done) => {
        // var _Hospital_arr = [];
        var disease_name = conversation.messagePayload().text;
        var promise = hitQuery(disease_name).then(() => {
            try {            
                if(Hospital_arr.length==1|Hospital_arr.length==0){
                    conversation.reply({ text: '[병명]\n' + Hospital_arr[0].name });
                    conversation.reply(FBTemplate.genericFBT( Hospital_arr[0].pimg , Hospital_arr[0].name , Hospital_arr[0].major,'자세히 보기',Hospital_arr[0].purl ));
                    
                }
                else{
                    conversation.reply({ text: Hospital_arr.length + '개의 과가 있습니다.' });
                    
                    var inner=[]
                    for(var i=0; i<Hospital_arr.length;){

                        if(Hospital_arr[i].imageurl!='undefined'){
                            inner.push(FBTemplate.genrInnerFBT(Hospital_arr[i].pimg , Hospital_arr[i].name , Hospital_arr[i].major, '자세히 보기', Hospital_arr[i].purl));
                        
                            if(i==9){ break; } //10명이상이면 더보기 버튼 or 대화로 의료진 리스트 링크 줌. 
                        }

                        i++;
                    }
                    conversation.reply(FBTemplate.cardFBT( inner ));
                    
                }
                
            
            }
            catch (e) { //db에서 null값을 가져올 경우
                conversation.reply({ text: '요청하신 ' + disease_name + '의 정보를 가져오지 못했어요. 죄송해요ㅠ' });

            }
            conversation.transition();
            done();

        }).catch(err => {
            reject(err);
        });


    }
};

