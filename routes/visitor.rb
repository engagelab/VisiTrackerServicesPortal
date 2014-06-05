######################## Visitor ##################################
class Iobserve < Sinatra::Application

  ### create a visitor group by visitorgroup id
  post '/visitorgroup/:visitorgroup_id/visitor' do
    content_type :json
    request.body.rewind  # in case someone already read it
    content_type :json

    bdy = request.body.read

    if bdy.length > 2 then
      data = JSON.parse bdy
    end

    visitorgroup = Visitorgroup.find(params[:visitorgroup_id])
    unless visitorgroup.nil? then
      status 200

      if visitorgroup.visitors.size < 4 then
        visitor = Visitor.create(:created_on => params[:nocache])
        visitorgroup.visitors << visitor
        visitorgroup.save

        unless data.nil? then
          unless data['age'].nil? then
            visitor.update_attributes(:age => data['age'])
          end

          unless data['sex'].nil? then
            visitor.update_attributes(:sex => data['sex'])
          end

          unless data['nationality'].nil? then
            visitor.update_attributes(:nationality => data['nationality'])
          end

          unless data['comment'].nil? then
            visitor.update_attributes(:comment => data['comment'])
          end

          unless data['color'].nil? then
            visitor.update_attributes(:color => data['color'])
          end
        end

      else
        return {"message" => "Already 4 visitors in this visitorgroup"}.to_json
      end


      return visitorgroup.visitors.to_json
    else
      status 404
      return {"message" => "Error: visitorgroup not found"}.to_json
    end
  end

  ### list all visitorgroups by session id
  get '/visitorgroup/:visitorgroup_id/visitor' do
    content_type :json

    visitorgroup = Visitorgroup.find(params[:visitorgroup_id])
    unless visitorgroup.nil? then
      status 200
      return visitorgroup.visitors.to_json
    else
      status 404
      return {"message" => "Error: visitorgroup not found"}.to_json
    end
  end

  ### list all visitors
  get '/visitor' do
    content_type :json
    @visitor = Visitor.all()
    return @visitor.to_json
  end

  ###  get a visitor by id
  get '/visitor/:visitor_id' do
    content_type :json
    visitor = Visitor.find(params[:visitor_id])
    return visitor.to_json
  end


  ### update visitor's properties
  put '/visitor' do
    request.body.rewind  # in case someone already read it
    content_type :json;

    begin
      data = JSON.parse request.body.read
    end

    unless data.nil? or data['_id'].nil? then
      status 200

      visitor = Visitor.find(data['_id'])

      unless data['age'].nil? then
        visitor.update_attributes(:age => data['age'])
      end

      unless data['sex'].nil? then
        visitor.update_attributes(:sex => data['sex'])
      end

      unless data['nationality'].nil? then
        visitor.update_attributes(:nationality => data['nationality'])
      end

      unless data['comment'].nil? then
        visitor.update_attributes(:comment => data['comment'])
      end

      unless data['color'].nil? then
        visitor.update_attributes(:color => data['color'])
      end

      unless data['artefacts'].nil? then
        artefactsArray = data['artefacts']
        newArtefactsArray = []
        if artefactsArray.kind_of?(Array)
          artefactsArray.each do |resource_id|
            begin
              resource = Artefact.find(resource_id)
            rescue
              return {"message" => "Error: the artefact id provided does not exist"}.to_json
              halt 404
            end

            if resource
              newArtefactsArray.push(resource)
            end
          end

          if newArtefactsArray.length > 0 then
            visitor.artefacts.clear
            newArtefactsArray.each do |artefact|
              visitor.artefacts << artefact
            end
          end
        end
      end

      return visitor.to_json
    else
      status 404
      return {"message" => "Provide age, sex, nationality or comment"}.to_json
    end
  end

  ### delete a visitor by id
  delete '/visitor/:visitor_id' do
    request.body.rewind  # in case someone already read it
    content_type :json

    visitor = Visitor.find(params[:visitor_id])

    if visitor.nil? then
      status 404
    else

      visitorgroup = Visitorgroup.find(visitor.visitorgroup_id)
      visitorgroup.visitors.each do |v|
        if v == visitor then
          visitorgroup.visitors.delete(v)
        end
      end
      visitorgroup.save!

      if visitor.destroy then
        status 200
        return {"message" => "Visitor deleted"}.to_json
      else
        status 500
      end
    end
  end
end
