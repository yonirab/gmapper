import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { AlertController } from 'ionic-angular/components/alert/alert-controller'; 

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  geneMappings: any;
  geneId1 : string;
  geneId2 : string;
  geneId3 : string;

  constructor(public navCtrl: NavController, 
              public http: Http,
              public alertCtrl: AlertController) {
  }
  
  geneIdsForm() {
    
    let genes = [];
    if (this.geneId1) genes.push({"query":this.geneId1.toLowerCase()});
    if (this.geneId2) genes.push({"query":this.geneId2.toLowerCase()});
    if (this.geneId3) genes.push({"query":this.geneId3.toLowerCase()});
    
    let body={genes};
    
    this.http
      .post(`${window.location.origin}/mappings`,body)
      .map(res => res.json()).subscribe(
        data => {
            this.geneMappings = data.genes;
            
            let notFound = this.geneMappings
                            .filter(geneMapping=>geneMapping.results.length===0)
                            .map(geneMapping=>geneMapping.query)
                            .join(' or ');
            
            if (notFound.length) {
              let noResult = this.alertCtrl.create({
                title: `No matches found for ${notFound}`,
                buttons: ['OK']  
              });
              noResult.present();  
            }
        },
        err => {
            let oops = this.alertCtrl.create({
              title: 'Oops!',
              // Input that failed to pass Joi schema validation causes a 400,
              // in which case we display to the user whatever comes after the '-'
              subTitle: err.status===400 ? err._body.split('-')[1] : err._body,
              buttons: ['OK']  
            });
            oops.present();
        }
      );
 
    
  }

}


