import './App.css';
import Products from './Products.json';
import React, {useEffect, useState} from 'react';
import Modal from '@mui/material/Modal';
import {Checkbox} from "@mui/material";
import webSocket from 'socket.io-client'

export default function App() {
  const [Choose,setChoose]=useState({Type:'',TypeIndex:0,Name:'',Price:0,ProductIndex:0});
  const [ModalVisible,setModalVisible]=useState(false);
  const [Spicy,setSpicy]=useState([true,false,false,false]);
  const [NumOfBuy,setNumOfBuy]=useState(1);
  const [Details,setDetails]=useState('');
  const [ProductInCar,setProductInCar]=useState([]);
  const [CarVisible,setCarVisible]=useState(false);
  const [ws,setWs] = useState(null);
  const [BossIn,setBossIn]=useState(false);

  const connectWebSocket = () => {
    //開啟
    setWs(webSocket('http://localhost:8000'))
  }
  const initWebSocket = () => {
    ws.on('Boss', message => {
      let tmp=JSON.parse(message);
      setBossIn(tmp.Boss);
    })
  }

  useEffect(()=>{
    if(ws){
      //連線成功在 console 中打印訊息
      console.log('Success connect!')
      //設定監聽
      initWebSocket()
    }
  },[ws])

  const sendMessage = () => {
    ws.emit('getMessage', '只回傳給發送訊息的 client');
  }
  const SpicyChange=(index)=>{
    let tmp=[...Spicy];
    tmp=[false,false,false,false];
    tmp[index]=true;
    setSpicy(tmp);
  }

  const NumChange=(flag)=>{
    let tmp=Number(NumOfBuy);
    if(flag){
      tmp+=1;
    }
    else if(tmp>1){
      tmp-=1;
    }
    setNumOfBuy(tmp);
  }

  const JoinToCar=()=>{
    if(NumOfBuy===0){
      alert('錯誤訊息!\n項目數不能是0');
      return;
    }
    let spicy=''
    if(Spicy[0]){
      spicy='不辣';
    }
    else if(Spicy[1]){
      spicy='小辣';
    }
    else if(Spicy[1]){
      spicy='中辣';
    }
    else if(Spicy[1]){
      spicy='大辣';
    }
    ProductInCar.push({'Type':Choose.Type,'TypeIndex':Choose.TypeIndex,'Name':Choose.Name,'Price':Choose.Price,'ProductIndex':Choose.ProductIndex,'Number':NumOfBuy,'Spicy':spicy,'Details':Details});
    ProductInCar.sort((a,b)=>{
      if(a.TypeIndex===b.TypeIndex){
        if(a.ProductIndex===b.ProductIndex){
          return 0;
        }
        else{
          return a.ProductIndex>b.ProductIndex?1:-1;
        }
      }
      else{
        return a.TypeIndex>b.TypeIndex?1:-1;
      }
    });
    setProductInCar(ProductInCar);
    setSpicy([true,false,false,false]);
    setNumOfBuy(1);
    setDetails('');
    setModalVisible(false);
  }

  const RemoveInCar=(index)=>{
    let tmp=[...ProductInCar];
    tmp.splice(index,1);
    setProductInCar(tmp);
  }
  return (
      <div className="App">

        <header className="App-header">
          <h1 className="Title-text">莊媽媽魯麵</h1>
        </header>

        <Modal open={ModalVisible} onClose={()=>{setModalVisible(false)}}>
          <div className='MyModal'>
            <h1>{Choose.Type}</h1>

            <p>品名 : {Choose.Name}</p>
            <p>價格 : {Choose.Price} 元</p>
            <div className='App-Modal-div'>
              <Checkbox checked={Spicy[0]} onChange={()=>{SpicyChange(0);}}></Checkbox>
              <p>無辣</p>
              <Checkbox checked={Spicy[1]} onChange={()=>{SpicyChange(1);}}></Checkbox>
              <p>小辣</p>
              <Checkbox checked={Spicy[2]} onChange={()=>{SpicyChange(2);}}></Checkbox>
              <p>中辣</p>
              <Checkbox checked={Spicy[3]} onChange={()=>{SpicyChange(3);}}></Checkbox>
              <p>大辣</p>
            </div>
            <div className='App-Modal-div'>
              <p style={{flex:5}}></p>
              <p style={{flex:3}}>數量 : </p>
              <button className={'App-Modal-btn'} onClick={()=>{NumChange(false);}}>
                <h2 className='App-Modal-btn-text'>-</h2>
              </button>
              <input value={NumOfBuy} type="number" className='App-Modal-num' onChange={(e)=>{if(e.target.value==='' || e.target.value<0){e.target.value=0}else{e.target.value=Number(e.target.value);}setNumOfBuy(e.target.value)}}/>
              <button className={'App-Modal-btn'} onClick={()=>{NumChange(true);}}>
                <h2 className='App-Modal-btn-text'>+</h2>
              </button>
              <p style={{flex:5}}></p>
            </div>
            <textarea onChange={(e)=>{setDetails(e.target.value);}} placeholder={'備註'} className='App-Modal-input'/>
            <button className='App-Modal-submit' onClick={JoinToCar}>
              <p className='App-text-car'>加入購物車</p>
            </button>
          </div>
        </Modal>

        <body className="App-body">
        {Products.Data.map((item,index)=>{
          return(
              <div className='App-div' key={index}>
                <h2>{item.Type}</h2>
                <div className='App-div-subtitle'>
                  <p className='App-div-text'>品名</p>
                  <p className='App-div-text'>價格</p>
                </div>
                {item['Name&Price'].map((inneritem,innerindex)=>{
                  return (
                      <button style={{marginBottom:innerindex===item['Name&Price'].length-1?'2.5%':0}} key={innerindex} className='App-div-div' onClick={()=>{setChoose({Type:item.Type,TypeIndex:index,Name:inneritem.Name,Price:inneritem.Price,ProductIndex:innerindex});setModalVisible(true);}}>
                        <p className='App-div-text'>{inneritem.Name}</p>
                        <p className='App-div-text'>{inneritem.Price}</p>
                      </button>
                  )
                })
                }
              </div>
          )
        })}
        </body>

        <div className='App-div-car'>
          <button className='App-btn-car' onClick={()=>{setCarVisible(true);if(ws===null) {connectWebSocket();}}}>
            <p className='App-text-car'>購物車</p>
          </button>
        </div>

        <div className='App-div-car' style={{position:'relative',marginTop:'3%',opacity:0}}>
          <div className='App-btn-car'>
            <p className='App-text-car'>購物車</p>
          </div>
        </div>

        <Modal open={CarVisible}>
          <div className='MyModal'>
            <div className='App-car-title-div'>
              <button className='App-car-title-btn' onClick={()=>{setCarVisible(false);}}>
                <h1>{'<'}</h1>
              </button>
              <h1 className='App-car-title-text'>購物車</h1>
              <div className='App-car-title-btn'></div>
            </div>
            {ProductInCar.map((item,index)=>{
              return (
                  <div key={index} className='App-car-cards'>
                    <div className='App-car-cards-div'>
                      <p>種類 : {item.Type}</p>
                      <p>品名 : {item.Name}</p>
                      <p>辣度 : {item.Spicy}</p>
                    </div>
                    <div className='App-car-cards-div'>
                      <p>{item.Price} 元</p>
                      <p>{item.Number} 份</p>
                      <p>共 {item.Price*item.Number} 元</p>
                    </div>
                    <div className='App-car-cards-div'>
                      <p style={{marginRight:'2.5%',wordBreak:'break-all'}}>{item.Details}</p>
                      <button className='App-car-delete-btn' onClick={()=>{RemoveInCar(index);}}>
                        <p style={{color:'white'}}>刪除此項目</p>
                      </button>
                    </div>
                  </div>
              )
            })}

            <button className='App-Modal-submit' onClick={JoinToCar}>
              <p className='App-text-car'>完成訂單</p>
            </button>
          </div>
        </Modal>
      </div>
  );
}
