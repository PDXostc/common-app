#
port="/dev/ttyS0"
# port="/dev/stdout"

# initPart1
echo "+970200" > $port
sleep 1
echo "+9703" > $port
sleep 1
echo "+980000" > $port
sleep 1
echo "+1001" > $port
sleep 1
echo "+980000" > $port
sleep 1
echo "+22" > $port
sleep 1
echo "+B4" > $port
sleep 1
echo "+B5" > $port
sleep 1
echo "+B50101" > $port
sleep 1
echo "+B50201" > $port
sleep 1
echo "+1000" > $port
sleep 1
echo "+B5" > $port
sleep 1
echo "+5A0000000100001" > $port
sleep 1
echo "+45" > $port
sleep 1
echo "+98" > $port
sleep 1
echo "+9803E8" > $port
sleep 1
echo "initPart1 done"

#initPart2
echo "+4C0010"  > $port
sleep 1
echo "+4C1010" > $port
sleep 1
echo "+4C2010" > $port
sleep 1
echo "+4C3010" > $port
sleep 1
echo "+4C4501" > $port
sleep 1
echo "+4C5501" > $port
sleep 1
echo "+4C5701" > $port
sleep 1
echo "+42" > $port
sleep 1
echo "+89408701" > $port
sleep 1
echo "+AD" > $port
sleep 1
echo "+22" > $port
sleep 1
echo "+41" > $port
sleep 1
echo "+44" > $port
sleep 1
echo "+80" > $port
sleep 1
echo "+4F" > $port
sleep 1
echo "+4E0108" > $port
sleep 1
echo "+50" > $port
sleep 1
echo "+52" > $port
sleep 1
echo "+84" > $port
sleep 1
echo "+AA" > $port
sleep 1
echo "+AB" > $port
sleep 1
echo "+99" > $port
sleep 1
echo "+49" > $port
sleep 1
echo "+B50101" > $port
sleep 1
echo "+B50201" > $port
sleep 1
echo "initPart2 done"

#initPart3
echo "+8006" > $port
sleep 1
echo "+AD0C" > $port
sleep 1
echo "+4F00" > $port
sleep 1
echo "+4D010000000000" > $port
sleep 1
echo "+5000" > $port
sleep 1
echo "+AB01" > $port
sleep 1
echo "+5900" > $port
sleep 1
echo "+89408701" > $port
sleep 1
echo "+AD" > $port
sleep 1
echo "+AA" > $port
sleep 1
echo "+49" > $port
sleep 1
echo "initPart3 done"

# setMasterMode
# Dup. of initPrt3 above        self.writeToDevice(AUDIO_DEVICE, AUDIO_MODE, "+8006\r\n", function() {
# echo "+89408701"  > $port
# Needed? echo "+AD"  > $port

# analogToChannels0to3
echo "+AA" > $port
sleep 1
echo "+A900" > $port
sleep 1
echo "+A804" > $port
sleep 1
echo "+8B40000042" > $port
sleep 1
echo "+8C40000001" > $port
sleep 1
echo "+8B4000014A" > $port
sleep 1
echo "+8C40000101" > $port
sleep 1
echo "+8B40000262" > $port
sleep 1
echo "+8C40000201" > $port
sleep 1
echo "+8B4000036A" > $port
sleep 1
echo "+8C40000301" > $port
sleep 1

echo "Done"
