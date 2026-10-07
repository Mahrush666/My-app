export function alignReading(expected:string,heard:string){
 const tokenize=(s:string)=>s.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)||[];
 const a=tokenize(expected),b=tokenize(heard).slice(0,300);const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
 const matched=new Set<number>();let i=a.length,j=b.length;while(i>0&&j>0){if(a[i-1]===b[j-1]){matched.add(i-1);i--;j--}else if(dp[i-1][j]>=dp[i][j-1])i--;else j--}
 return {recognized:matched.size,total:a.length,practice:[...new Set(a.filter((_,index)=>!matched.has(index)))],words:a.map((word,index)=>({word,recognized:matched.has(index)}))};
}
