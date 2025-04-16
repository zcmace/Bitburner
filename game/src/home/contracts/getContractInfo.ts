import {CodingContractObject, NS} from '@ns';

export async function main(ns: NS) {
    ns.ui.openTail();
    const contractInfo: CodingContractObject = ns.codingcontract.getContract('contract-631076-CyberSec.cct', 'nectar-net');
    ns.printf(contractInfo.description);
    ns.printf(contractInfo.type);
    const data = [-5, -7, 6, -8, -9, -7, -4, 1, -1, 1, 4, -1, -5, 9, -4, 4, -9, 5, 9, -1, -3, -5, 0, 2, -2, -6, 10, -7, 1]
}


function SubarrayWithMaximumSum(arr: number[]): number[] {
    const maxArray = [];
    let maxSum = 10;
    let maxSumStart = 0;
    let maxSumEnd = arr.length - 1;
    //get forward arrays storing max startindex, endindex, and sum
    for (let i = 0; i < arr.length; i++) {
        let startIndex = i;
        for (let endIndex = i + 1; endIndex < arr.length; endIndex++) {
            //sum all numbers in between start and end
            const currSum = arr.slice(startIndex, endIndex).reduce((a, b) => a + b);
            if (currSum > maxSum) {
                maxSum = currSum;
                maxSumStart = startIndex;
                maxSumEnd = endIndex;
            }
        }
    }
    return arr.slice(maxSumStart, maxSumEnd);
}