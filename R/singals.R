######################################################################
##arg read
#arg0 : stockId
#arg1 : workingDir
######################################################################
args<-commandArgs(TRUE)
stockId = ifelse(length(args) > 0,args[1],'2330.TW')

wdPath = ifelse(length(args) > 1,args[2],'./')
if(!dir.exists(wdPath))
  dir.create(wdPath)
setwd(wdPath)
######################################################################
### Get Realtime Stock Data
######################################################################
showDays = 150

library(quantstrat)
Xt = getSymbols(stockId,auto.assign = F)
qo = getQuote(stockId)

lastDate = as.POSIXlt(qo$`Trade Time`)
lastDateForXt = as.Date(lastDate)
#if has newest data
if(lastDateForXt > tail(index(Xt),1))
{
  library(RCurl)
  library(rjson)
  
  if(grepl(".TW",stockId))
  {
    if(grepl(".TWO",stockId))
    {
      stockId_TW = gsub(".TWO","",stockId)
      stockId_TW = paste("otc_",stockId_TW,".tw",sep="")
    }
    else
    {
      stockId_TW = gsub(".TW","",stockId)
      stockId_TW = paste("tse_",stockId_TW,".tw",sep="")
    }

    curl = getCurlHandle()
    agent="Mozilla/5.0" #
    curlSetOpt(  cookiejar="", useragent = agent, followlocation = TRUE, curl=curl)
    getCookie = getURL("http://mis.twse.com.tw/stock/api/getStockInfo.jsp?",curl=curl)
    currString = getURL(paste("http://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=",stockId_TW,sep=""),curl=curl)
    currData = fromJSON(currString)
    now = currData$msgArray[[1]]
    qo$Low = now$l
    qo$High = now$h
    qo$Last = now$z
    qo$Open = now$o
    qo$Volume = now$v
  }
  else
  {
    currString = getURL(paste("http://finance.google.com/finance/info?q=",stockId,sep=""))
    if(!grepl("Response Code 400",currString))
    {
      currString = gsub("//","",currString)
      currData = fromJSON(currString)
      cur = (currData[[1]])$l_fix[1]
      qo$Last = as.numeric(cur)
      if(qo$Last > qo$High)
        qo$High = qo$Last
      if(qo$Last < qo$Low)
        qo$Low = qo$Last
    }
  }
  
  goXt = xts(matrix(c(qo$Open,qo$High,qo$Low,qo$Last,qo$Volume,qo$Last),nrow=1),
             order.by=lastDateForXt)
  
  Xt = rbind(Xt,goXt)
}

#name = paste(getQuote(stockId, what=yahooQF("Name"))[,2]) 
######################################################################
### Crossover Events Detection
######################################################################
BBandsDN = function(mktdata,n) BBands(mktdata)$dn

Xt$BBandsDN = BBandsDN(HLC(Xt),n=20)
Xt$SMA = SMA(Cl(Xt),n=20)

clCrossOverBBandDn = sigCrossover(label="Cl.lt.BBandsDN",
                                  data=Xt,
                                  columns=c("Close","BBandsDN"),
                                  relationship="lt")

clCrossOverSMA60 = sigCrossover(label="Cl.gt.SMA",
                                data=Xt,
                                columns=c("Close","SMA"),
                                relationship="gt")

XtBuy = Lo(Xt)[!is.na(clCrossOverBBandDn)]
XtSell = Hi(Xt)[!is.na(clCrossOverSMA60)]

png("output.png",width = 1000, height = 562, units = "px")

chartSeries(tail(Xt,showDays),TA = NULL,name = stockId,theme="white")
addBBands()
addSMA(n=20)

liftRatio = 0.01
b = XtBuy*(1-liftRatio)
s = XtSell*(1+liftRatio)

addTA(b,on=1,type="p",col=2,pch=24,bg="red")
addTA(s,on=1,type="p",col=3,pch=25,bg="green")
#addVo()

dev.off()

##########################output##############
buy = tail(OHLCV(Xt),showDays)[index(XtBuy)]
sell = tail(OHLCV(Xt),showDays)[index(XtSell)]
last = tail(OHLCV(Xt),2);

write.csv(as.data.frame(buy),file="buy.csv")
write.csv(as.data.frame(sell),file="sell.csv")
write.csv(as.data.frame(last),file="last.csv")
