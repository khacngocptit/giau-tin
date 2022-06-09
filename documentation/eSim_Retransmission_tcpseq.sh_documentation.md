# Documentation of Script [`eSim_Retransmission_tcpseq.sh`](https://github.com/cdpxe/nefias/blob/master/scripts/eSim_Retransmission_tcpseq.sh)

Contents:

* Short description
* Author
* Comment/reference
* Functionality
* Testing and evaluation of the script
* Customize script for own research
* Further notes
* References


### Short Description

Calculates epsilon similarity scores using a static window size (2,000) on the basis of tcp retransmissions (per flow); this script helps to detect network covert channels that use artificial (tcp) retransmissions of network packets (such covert channels implement the so-called [Retransmission](http://ih-patterns.blogspot.com/p/p11-re-transmission-pattern.html) hiding pattern)

### Author

Kevin Albrechts, in cooperation with Steffen Wendzel

### Comment/Reference

Implementation of epsilon similarity for retransmission pattern described by (Zillien and Wendzel, 2018).

### Functionality

##### Input

* Chunk of the traffic recording (`--traffic-source=`) to be analysed
* Jobname

##### Output

* A file that contains one line per flow, where the flow is part of the input chunk and has at least the amount of packets defined by `head -n`. Here, a flow is referred to as one direction of a TCP-conncection. A flow, therefore, is characterized by a sender and a receiver IP address plus port numbers.
* A line consists of the flow information, such as source and destination IP addresses plus TCP port numbers, followed by the calculated epsilon similarity scores (in %).
* The epsilon similarity scores of the following epsilon values are calculated: 0.01, 0.2, 2.5 and >= 2.5 .

##### Computation Steps

The script starts with including the functionality of the NeFiAS library script [`nefias_lib.sh`](https://github.com/cdpxe/nefias/blob/master/scripts/nefias_lib.sh).

Afterwards, the flows are initialized by calling `NEFIAS_INIT_PER_FLOW`. The third parameter within this statement is `"tcp"`. This is chosen because only network packets containing tcp segements are relevant to the [Retransmission](http://ih-patterns.blogspot.com/p/p11-re-transmission-pattern.html) hiding pattern.

The script mainly consists of a for loop over all flows of the input chunk. Within this loop, the following computation steps are carried out:

1. "Grab" (`grep`) the first 2,000 packets of a flow. (Each packet correponds to a line in the input chunk file.)
2. Process these packets with `gawk` (whereas the program-file is specified directly):
   - BEGIN: Epsilon values are declared and initialized.
   - Action statements: All tcp sequence numbers are saved based on `tcp_seq` (corresponds to `tcp.seq`).
   - END:
     - We make sure the window is filled with enough packets (defined by head -n, i.e., 2,000 packets here). If this condition is false, END does not do anything further, i.e. go to step 3.
     - From all tcp sequence numbers, extract only the sequence numbers of retransmissions: When extracting the retransmissions (or the sequence numbers) from all packets/TCP segments, the script checks for each packet in the flow in the order of arrival (i.e. in the unsorted list/array) whether any packet coming after it in the list has the same sequence number. If so, the sequence number is extracted/copied into the retransmission array. In case of multiple retransmissions, i.e. if a packet/TCP segment is transmitted more than once, the sequence numbers are extracted again. This means, each retransmission sequence number is extracted, possibly even several times (several times if a segment was retransmitted at least twice). After all, the list/array of retransmissions might contain a sequence number more than once. Please note: Flows that mostly contain only ACK packets contain a lot of retransmissions, i.e. almost all packets, since, here, retransmissions are only evaluated based on tcp.seq (the TCP sequence number). Such flows are often found in legitimate traffic. However, covert channels with the retransmission pattern usually contain flows where the tcp.seq increases continuously (except for the retransmitted segments). See (Zillien and Wendzel, 2018) for more information on these covert channels.
     - Next, the following condition is checked: There must be at least 3 retransmissions to calculate the epsilon similarity scores. Otherwise, an error because of division by 0 would occur in the remainder of the calculation. Therefore, if a flow has both enough packets (see head -n for window length) and less than 3 retransmissions within the window, the script will not calculate epsilon similarity scores but instead it prints out the information "no or not enough (<=2) retransmissions existent".
     - So if enough retransmissions exist, the next step is to calculate the distances delta between each retransmission and the previous retransmission (except for the last one).
     - Afterwards, the deltas are sorted.
     - Calculate the pairwise relative differences lambda. Please note: If a distance delta equals 0, the corresponding lambda value is also set to 0. This serves to avoid a division by 0, since delta is in the denominator of the quotient when calculating lambdas.
     - Count the number of lambdas which are below the respective epsilon values.
     - Calculate the epsilon similarity scores.
     - Concatenate the epsilon similarity scores to a single string. (in %, rounded to two decimal places)
     - Print out the string of the epsilon similarity scores.
3. Redirect the output of step 2 (either a line of epsilon similarity scores or empty): Overwrite the temporary working file `${TMPWORKFILE}` with this output.
4. Paste the output of step 2 (contained in `${TMPWORKFILE}`) into the temporary results file `${TMPRESULTSFILE}`: If `${TMPWORKFILE}` is empty, `${TMPRESULTSFILE}` will be empty as well. Otherwise, the flow information and the epsilon similarity scores are concatenated and written to `${TMPRESULTSFILE}`.
5. Delete the temporary working file `${TMPWORKFILE}`.


Lastly, the script calls `NEFIAS_FINISH` to finalize the processing of the chunk.

### Testing and Evaluation of the Script


##### Traffic Recordings

* Legitimate Traffic: Part of NZIX-II data of [WAND Network Research Group](https://wand.net.nz/wits/nzix/2/). The [file](https://wand.net.nz/wits/nzix/2/20000705-152900.php) containing traffic from Wed Jul 5 15:29:00 2000 to Wed Jul 5 17:59:59 2000 was split into 6 almost equally sized files by libtrace for better processing. From the first 4 files, those IP (one-directional) connections were extracted which contain at least 2,001 packets, and from the last 2 files, those with at least 5,000 packets were extracted. Each extracted connection was saved to one file each. To sum up, 542 files were used for testing.
* Covert Channels: The traffic recordings used for testing were provided by Sebastian Zillien and Steffen Wendzel and can be found [here](https://github.com/cdpxe/nefias/tree/master/recordings/covert_channel_retransmission_pattern).

##### Plots

###### Legitimate Traffic

In addition to the data sets for testing, a legitimate flow from reading newspaper online was recorded (not part of testing) using `tshark`. The newspaper [NWZ Online](https://www.nwzonline.de/) was opened on Sept. 9th 2020 at 22:33. Several articles and local sites were openend and read to simulate legitimate traffic and "normal" behavior on the internet. Recording stopped at 22:55 after 5,000 packets (of both flows/directions). The file can be found [here](https://github.com/cdpxe/nefias/tree/master/recordings/Legitimate_flow_of_reading_newspaper). For the first 2,001 packets of the flow from the newspaper's server to the local (and recordring) host, the following plots show the unsorted deltas, the sorted deltas and the lambdas.


<p align="center">
  <img src="https://github.com/cdpxe/nefias/blob/master/documentation/images/epsilon-similarity_retransmission/Veusz_Retransmission_NWZ_Zeitung_unsorted_deltas.png" width="600" title="Unsorted deltas">
</p>

<p align="center">
  <img src="https://github.com/cdpxe/nefias/blob/master/documentation/images/epsilon-similarity_retransmission/Veusz_Retransmission_NWZ_Zeitung_sorted_deltas.png" width="600" title="Sorted deltas">
</p>

<p align="center">
  <img src="https://github.com/cdpxe/nefias/blob/master/documentation/images/epsilon-similarity_retransmission/Veusz_Retransmission_NWZ_Zeitung_lambdas.png" width="600" title="Lambdas">
</p>



###### Covert Channel

The following plots visualize the unsorted deltas, the sorted deltas and the lambdas of the first 2,000 packets of the flow from `130.225.254.116` to `143.93.190.252` of the recordings contained in the file "Denmark_17_09_2018_15_24_03.pcap_CLEANED.pcap_covert_0_50_10_20.csv" (can be found [here](https://github.com/cdpxe/nefias/tree/master/recordings/covert_channel_retransmission_pattern)) of a covert channel with Retransmission hiding pattern. The channel uses parameters O=0, D=50, I=10, J=20.


<p align="center">
  <img src="https://github.com/cdpxe/nefias/blob/master/documentation/images/epsilon-similarity_retransmission/Veusz_Retransmission_covert2_unsorted_deltas.png" width="600" title="Unsorted deltas">
</p>

<p align="center">
  <img src="https://github.com/cdpxe/nefias/blob/master/documentation/images/epsilon-similarity_retransmission/Veusz_Retransmission_covert2_sorted_deltas.png" width="600" title="Sorted deltas">
</p>

<p align="center">
  <img src="https://github.com/cdpxe/nefias/blob/master/documentation/images/epsilon-similarity_retransmission/Veusz_Retransmission_covert2_lambdas.png" width="600" title="Lambdas">
</p>



##### Results



If the script is run with the legitimate traffic described above, it produces results in the following form, whereas this is only an extract of all results:

```
$ cat results/*
10.0.8.132,10.0.53.31,,,25,24327,,, eSim(0.01)=100.00%, eSim(0.2)=100.00%, eSim(2.5)=100.00%, eSim(>=2.5)=0.00%
10.3.78.124,10.5.82.142,,,2384,6699,,, eSim(0.01)=100.00%, eSim(0.2)=100.00%, eSim(2.5)=100.00%, eSim(>=2.5)=0.00%
10.0.33.168,10.0.219.217,,,25,3956,,, eSim(0.01)=100.00%, eSim(0.2)=100.00%, eSim(2.5)=100.00%, eSim(>=2.5)=0.00%
10.0.33.168,10.0.219.217,,,25,3956,,, eSim(0.01)=100.00%, eSim(0.2)=100.00%, eSim(2.5)=100.00%, eSim(>=2.5)=0.00%
10.0.0.27,10.0.5.160,,,7070,1147,,, eSim(0.01)=27.27%, eSim(0.2)=72.73%, eSim(2.5)=95.45%, eSim(>=2.5)=4.55%
10.0.0.91,10.0.10.235,,,2244,80,,, eSim(0.01)=99.95%, eSim(0.2)=99.95%, eSim(2.5)=99.95%, eSim(>=2.5)=0.05%
10.0.2.53,10.1.27.100,,,61623,20,,, eSim(0.01)=33.33%, eSim(0.2)=66.67%, eSim(2.5)=100.00%, eSim(>=2.5)=0.00%
10.0.2.53,10.1.27.100,,,61623,20,,, eSim(0.01)=11.11%, eSim(0.2)=33.33%, eSim(2.5)=77.78%, eSim(>=2.5)=22.22%
```



The results can be found [here](https://github.com/cdpxe/nefias/tree/master/documentation/results/epsilon-similarity_retransmission). The following table shows the arithmetic averages and standard deviations of the epsilon similarity scores for several epsilon values:

<p align="center">
  <img src="https://github.com/cdpxe/nefias/blob/master/documentation/results/epsilon-similarity_retransmission/test_results_eSim_Retransmission.png" width="800" title="Test results for eSim of Retransmission pattern">
</p>


According to (Zillien and Wendzel, 2018), the decision heuristic is as follows: A flow is classified as covert if at least 2 of the following 3 conditions hold:

* For epsilon = 0.01: The epsilon similarity score is less than or equal to 99.70%.
* For epsilon = 0.2: The epsilon similarity score is greater than or equal to 95.00%.
* For epsilon = 2.5: The epsilon similarity score is (greater than or) equal to 100.00%.

Applying this decision heuristics to the flows from above, the following detection results are obtained:

<p align="center">
  <img src="https://github.com/cdpxe/nefias/blob/master/documentation/results/epsilon-similarity_retransmission/detection_results_eSim_Retransmission.png" width="600" title="Detection results for eSim of Retransmission pattern">
</p>

The following plot shows accuracy, precision and recall of the detection results:

<p align="center">
  <img src="https://github.com/cdpxe/nefias/blob/master/documentation/results/epsilon-similarity_retransmission/Precision_Accuracy_Recall-Retransmission-detection_results.png" width="600" title="Accuracy, precision and recall of the detection results for eSim of Retransmission pattern">
</p>



### Customize Script for Own Research

##### Window size

If you want to change the window size, you need to make modifications to the following parts of the script:

* At the beginning of the for loop: `head -n`
* At the beginning of the END block within the gawk program-file: The first part of the if condition `if (counter == 2000)`

##### Epsilon values

If you want to change the epsilon values, you need to make modifications to the following parts of the script (not necessarily all of them):

* In the BEGIN block within the gawk program-file: e.g. `epsilon_1=<your value>` or if you want to add an additional epsilon value, append `epsilon_5=<your value>; epsilon_5_counter=0`
* In the END block within the gawk program-file where the number of lambdas, which are below the respective epsilon values, is counted: e.g. `if (arr_lambda[i] < epsilon_1) epsilon_1_counter++`
* In the END block within the gawk program-file where the epsilon similarity scores are explicitly calculated: e.g. `eSim_1 = epsilon_1_counter / length(arr_lambda)`
* In the END block within the gawk program-file where the epsilon similarity scores are concatenated to a single string


### Further Notes

* The script requires `gawk` due to built-in functions asort() und length().


### References

* (Zillien und Wendzel, 2018) S. Zillien, S. Wendzel: [Detection of covert channels in TCP retransmissions](https://link.springer.com/chapter/10.1007%2F978-3-030-03638-6_13), in Proc. 23rd Nordic Conference on Secure IT Systems (NordSec), LNCS Vol. 11252, pp. 203-218, Springer, 2018.
